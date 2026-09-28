const prisma = require('../config/prisma');
const { disconnectUser } = require('../sockets/socketManager');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalProjects, totalTasks, completedTasks, notifications, overdueTasks, recentUsers] = await Promise.all([
      prisma.user.count(),
      prisma.project.count(),
      prisma.task.count(),
      prisma.task.count({ where: { status: 'Completed' } }),
      prisma.notification.count(),
      prisma.task.count({ where: { dueDate: { lt: new Date() }, status: { not: 'Completed' } } }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, username: true, email: true, role: true, avatar: true, createdAt: true },
      }),
    ]);

    // New users today (User has createdAt)
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const newUsersToday = await prisma.user.count({ where: { createdAt: { gte: todayStart } } });

    // Tasks completed (Task has no updatedAt, so we return total completed)
    const tasksCompletedToday = completedTasks;

    // User growth: new users per day for past 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const userGrowth = await Promise.all(
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        const start = new Date(date.setHours(0, 0, 0, 0));
        const end = new Date(date.setHours(23, 59, 59, 999));
        return prisma.user
          .count({ where: { createdAt: { gte: start, lte: end } } })
          .then(count => ({ name: days[start.getDay()], users: count }));
      })
    );

    res.json({
      totalUsers, totalProjects, totalTasks, completedTasks,
      overdueTasks, notifications, recentUsers,
      tasksCompletedToday, newUsersToday, userGrowth,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, username: true, email: true, role: true, avatar: true, createdAt: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?.userId === id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!targetUser) return res.status(404).json({ message: 'User not found' });
    if (targetUser.role === 'admin' && await prisma.user.count({ where: { role: 'admin' } }) <= 1) {
      return res.status(409).json({ message: 'At least one administrator account must remain' });
    }

    await prisma.$transaction(async (tx) => {
      const ownedProjects = await tx.project.findMany({ where: { ownerId: id }, select: { id: true } });
      const ownedProjectIds = ownedProjects.map(({ id: projectId }) => projectId);
      const ownedTasks = await tx.task.findMany({
        where: { projectId: { in: ownedProjectIds } },
        select: { id: true },
      });
      const ownedTaskIds = ownedTasks.map(({ id: taskId }) => taskId);

      await tx.attachment.deleteMany({
        where: { OR: [{ projectId: { in: ownedProjectIds } }, { taskId: { in: ownedTaskIds } }] },
      });
      await tx.projectInvitation.deleteMany({
        where: { OR: [{ projectId: { in: ownedProjectIds } }, { inviterId: id }, { invitedUserId: id }] },
      });
      await tx.message.deleteMany({
        where: { OR: [{ projectId: { in: ownedProjectIds } }, { senderId: id }] },
      });
      await tx.projectMember.deleteMany({
        where: { OR: [{ projectId: { in: ownedProjectIds } }, { userId: id }] },
      });
      await tx.task.deleteMany({ where: { projectId: { in: ownedProjectIds } } });
      await tx.project.deleteMany({ where: { ownerId: id } });
      await tx.task.updateMany({ where: { assignedTo: id }, data: { assignedTo: null } });
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.refreshToken.deleteMany({ where: { userId: id } });
      await tx.passwordResetToken.deleteMany({ where: { userId: id } });
      await tx.user.delete({ where: { id } });
    });
    await disconnectUser(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Role must be either admin or user' });
    }
    if (role === 'user' && req.user?.userId === id) {
      return res.status(400).json({ message: 'You cannot remove your own administrator role' });
    }
    const currentUser = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (!currentUser) return res.status(404).json({ message: 'User not found' });
    if (currentUser.role === 'admin' && role === 'user' && await prisma.user.count({ where: { role: 'admin' } }) <= 1) {
      return res.status(409).json({ message: 'At least one administrator account must remain' });
    }
    const user = await prisma.user.update({ where: { id }, data: { role } });
    res.json({ id: user.id, username: user.username, role: user.role });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
      include: { owner: { select: { username: true, email: true } }, _count: { select: { tasks: true } } },
    });
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const tasks = await prisma.task.findMany({ where: { projectId: id }, select: { id: true } });
    const taskIds = tasks.map(({ id: taskId }) => taskId);

    await prisma.$transaction([
      prisma.attachment.deleteMany({
        where: { OR: [{ taskId: { in: taskIds } }, { projectId: id }] },
      }),
      prisma.projectInvitation.deleteMany({ where: { projectId: id } }),
      prisma.message.deleteMany({ where: { projectId: id } }),
      prisma.task.deleteMany({ where: { projectId: id } }),
      prisma.projectMember.deleteMany({ where: { projectId: id } }),
      prisma.project.delete({ where: { id } }),
    ]);
    res.json({ message: 'Project deleted' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const [recentUsers, recentProjects, recentTasks, recentNotifications] = await Promise.all([
      prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, username: true, email: true, role: true, avatar: true, createdAt: true } }),
      prisma.project.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { owner: { select: { username: true } } } }),
      prisma.task.findMany({ orderBy: { dueDate: 'desc' }, take: 10, where: { status: 'Completed' }, include: { project: { select: { title: true } }, assignee: { select: { username: true } } } }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { username: true } } } }),
    ]);

    const activities = [
      ...recentUsers.map(u => ({ id: `user:${u.id}`, type: u.role === 'admin' ? 'role_change' : 'register', label: u.role === 'admin' ? `Admin account: ${u.username}` : `New user registered: ${u.username}`, user: u.username, time: u.createdAt })),
      ...recentProjects.map(p => ({ id: `project:${p.id}`, type: 'project_create', label: `Project created: "${p.title}"`, user: p.owner?.username || 'unknown', time: p.createdAt })),
      ...recentTasks.map(t => ({ id: `task:${t.id}`, type: 'task_complete', label: `Task completed: "${t.title}" in ${t.project?.title}`, user: t.assignee?.username || 'a user', time: t.dueDate || new Date() })),
      ...recentNotifications.map(n => ({ id: `notification:${n.id}`, type: 'notification', label: n.message, user: n.user?.username || 'system', time: n.createdAt })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 30);

    res.json(activities);
  } catch (error) {
    console.error('Activity error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.broadcastNotification = async (req, res) => {
  try {
    const { message } = req.body;

    const users = await prisma.user.findMany({ select: { id: true } });
    await prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, message: `[Admin] ${message.trim()}` })),
    });

    res.json({ message: `Broadcast sent to ${users.length} users` });
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
