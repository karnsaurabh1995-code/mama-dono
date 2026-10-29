import { NextResponse } from 'next/server';
import { requireAdminApiAccess } from '@/lib/auth/admin-guard';
import { getMsg91Status } from '@/lib/auth/msg91';

export async function GET() {
  try {
    const auth = await requireAdminApiAccess(['super_admin', 'admin', 'support_admin']);
    if (auth.errorResponse) return auth.errorResponse;

    const status = getMsg91Status();
    return NextResponse.json({
      success: true,
      status,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to retrieve MSG91 status' }, { status: 500 });
  }
}
