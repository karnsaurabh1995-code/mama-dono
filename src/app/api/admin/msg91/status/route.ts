import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth/server';
import { getMsg91Status } from '@/lib/auth/msg91';

export async function GET() {
  try {
    const user = await getServerSession();
    if (!user || !['super_admin', 'admin', 'support_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const status = getMsg91Status();
    return NextResponse.json({
      success: true,
      status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve MSG91 status' }, { status: 500 });
  }
}
