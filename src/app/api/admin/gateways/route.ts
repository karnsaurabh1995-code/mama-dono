import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';
import { maskSecret } from '@/lib/security/crypto-vault';

/**
 * ADMIN PAYMENT GATEWAYS API
 *
 * GET: Lists configured gateways with masked secrets
 * POST: Updates gateway configuration with authenticated AES-256 encryption
 */

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'finance'].includes(session.role)) {
      return NextResponse.json({ error: 'Unauthorized: Gateway credentials restricted' }, { status: 401 });
    }

    const gateways = db.getGateways().map((gw) => ({
      ...gw,
      secretKey: maskSecret(gw.secretKey),
      webhookSecret: maskSecret(gw.webhookSecret),
      isConfigured: Boolean(gw.keyId && gw.secretKey),
    }));

    return NextResponse.json({
      success: true,
      gateways,
    });
  } catch (error: any) {
    console.error('[API /api/admin/gateways GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !['super_admin', 'admin', 'finance'].includes(session.role)) {
      return NextResponse.json(
        { error: 'Unauthorized: High-level authority required to configure payment gateways' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Gateway ID and updates payload required' }, { status: 400 });
    }

    const updated = db.updateGatewayConfig(id, updates, session.name || 'Finance Administrator');
    if (!updated) {
      return NextResponse.json({ error: 'Payment gateway not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Gateway ${updated.name} settings successfully updated`,
      gateway: {
        ...updated,
        secretKey: maskSecret(updated.secretKey),
        webhookSecret: maskSecret(updated.webhookSecret),
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/gateways POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
