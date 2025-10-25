import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optimized: Direct query, no extra user lookup needed
    const healthGoals = await prisma.healthGoal.findMany({
      where: { userEmail: session.user.email },
      orderBy: { createdAt: 'desc' },
      take: 30, // Max 30 goals
    });

    return NextResponse.json({ healthGoals });
  } catch (error) {
    console.error("Error fetching health goals:", error);
    return NextResponse.json({ error: "Failed to fetch health goals" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, target, current, progress, deadline, category } = body;

    const healthGoal = await prisma.healthGoal.create({
      data: {
        userEmail: session.user.email,
        title,
        target,
        current,
        progress,
        deadline,
        category
      }
    });

    return NextResponse.json(healthGoal);
  } catch (error) {
    console.error('Error creating health goal:', error);
    return NextResponse.json({ error: 'Failed to create health goal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.healthGoal.delete({
      where: { 
        id,
        userEmail: session.user.email 
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting health goal:', error);
    return NextResponse.json({ error: 'Failed to delete health goal' }, { status: 500 });
  }
}
