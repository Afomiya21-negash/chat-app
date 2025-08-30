import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../lib/db";
import { withAuth } from "../../../middlewares/auth";

async function putHandler(req: NextRequest, user: any) {
  if (req.method !== 'PUT') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { username, email } = await req.json();

    // Validate that at least one field is provided
    if (!username && !email) {
      return NextResponse.json({ error: 'At least one field must be provided' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};

    // Handle username update
    if (username && username.trim() !== existingUser.username) {
      if (username.trim().length < 3) {
        return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 });
      }

      // Check if username is already taken
      const usernameExists = await prisma.user.findUnique({
        where: { username: username.trim() }
      });

      if (usernameExists && usernameExists.id !== user.id) {
        return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
      }

      updateData.username = username.trim();
    }

    // Handle email update
    if (email && email.trim() !== existingUser.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
      }

      // Check if email is already taken
      const emailExists = await prisma.user.findUnique({
        where: { email: email.trim() }
      });

      if (emailExists && emailExists.id !== user.id) {
        return NextResponse.json({ error: 'Email already taken' }, { status: 400 });
      }

      updateData.email = email.trim();
    }

    // Update user if there are changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No changes to update' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (err: any) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function deleteHandler(req: NextRequest, user: any) {
  if (req.method !== 'DELETE') {
    return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Disconnect the user from all chats they are a member of
    const chats = await prisma.chat.findMany({
      where: {
        users: {
          some: {
            id: user.id,
          },
        },
      },
      select: { id: true },
    });

    for (const chat of chats) {
      await prisma.chat.update({
        where: { id: chat.id },
        data: {
          users: {
            disconnect: { id: user.id },
          },
        },
      });
    }

    // Delete all user's messages
    await prisma.message.deleteMany({
      where: { senderId: user.id }
    });

    // Delete groups created by the user
    await prisma.chat.deleteMany({
      where: {
        creatorId: user.id,
        type: 'group'
      }
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: user.id }
    });

    return NextResponse.json({
      message: 'Account and associated data deleted successfully'
    });

  } catch (err: any) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const PUT = withAuth(putHandler);
export const DELETE = withAuth(deleteHandler);