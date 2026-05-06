const loginUser = (req, res) => {
  const { username, password, role } = req.body;
  console.log(req.body);
  res.json({
    message: "Login data received",
    username,
    role
  });
};

module.exports = { loginUser };