// Sample user database (in real app, use proper database)
const users = [
  {
    id: 1,
    username: 'testuser',
    password: 'password123',
    email: 'testuser@example.com',
    role: 'user'
  },
  {
    id: 2,
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    role: 'admin'
  }
];

// Helper function to find user by credentials
const findUserByCredentials = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

// Helper function to find user by ID
const findUserById = (id) => {
  return users.find(user => user.id === id);
};

module.exports = {
  users,
  findUserByCredentials,
  findUserById
};
