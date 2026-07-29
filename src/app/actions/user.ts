"use server"

import { auth, clerkClient } from "@clerk/nextjs/server"

export async function updateProfile({
  firstName,
  lastName,
  email,
  jobTitle,
}: {
  firstName: string
  lastName: string
  email: string
  jobTitle: string
}) {
  const { userId } = await auth()
  if (!userId) {
    throw new Error("Not authenticated")
  }

  const client = await clerkClient()
  
  // Get current user to check email and metadata
  const user = await client.users.getUser(userId)
  const primaryEmail = user.emailAddresses.find(
    (e) => e.id === user.primaryEmailAddressId
  )?.emailAddress

  // Update name & metadata
  await client.users.updateUser(userId, {
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    unsafeMetadata: {
      ...user.unsafeMetadata,
      jobTitle: jobTitle.trim(),
    },
  })

  // If email changed, handle it
  if (email && email.trim() !== primaryEmail) {
    const targetEmail = email.trim()
    // Check if the email address already exists on this user
    const existingEmail = user.emailAddresses.find((e) => e.emailAddress === targetEmail)
    let emailId = existingEmail?.id

    if (!existingEmail) {
      const newEmail = await client.emailAddresses.createEmailAddress({
        userId,
        emailAddress: targetEmail,
        verified: true,
      })
      emailId = newEmail.id
    }

    // Now update user to make this email primary
    if (emailId) {
      await client.users.updateUser(userId, {
        primaryEmailAddressID: emailId,
      })
      
      // Optionally delete the old email address to keep it clean
      if (user.primaryEmailAddressId && user.primaryEmailAddressId !== emailId) {
        try {
          await client.emailAddresses.deleteEmailAddress(user.primaryEmailAddressId)
        } catch (err) {
          console.error("Failed to delete old email address", err)
        }
      }
    }
  }
  
  return { success: true }
}
