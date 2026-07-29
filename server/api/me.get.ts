export default defineEventHandler(async (event) => {
  const currentUser = await requireUser(event)

  return {
    user: {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      image: currentUser.image,
      emailVerified: currentUser.emailVerified,
    },
  }
})
