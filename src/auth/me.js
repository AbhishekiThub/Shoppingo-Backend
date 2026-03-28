export const getMe = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id).select("-password");

  res.status(200).json({
    success: true,
    user
  });

});