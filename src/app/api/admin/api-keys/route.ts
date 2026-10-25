import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/auth/server';
import { maskSecret } from '@/lib/security/crypto-vault';

/**
 * ADMIN API KEYS & SECRETS MANAGER API
 *
 * Restricted exclusively to Super Administrator authority.
 * Enforces AES-256-GCM secret encryption and redacts keys in all read responses.
 */

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'ACCESS DENIED: Super Administrator authority strictly required to inspect API credentials' },
        { status: 401 }
      );
    }

    const keys = db.getApiKeys(session).map((k) => ({
      ...k,
      secretKey: maskSecret(k.secretKey),
      webhookSecret: maskSecret(k.webhookSecret),
      isConfigured: Boolean(k.publicKey || k.secretKey),
    }));

    return NextResponse.json({
      success: true,
      keys,
      auditLogs: db.getApiAuditLogs(session).slice(0, 20),
    });
  } catch (error: any) {
    console.error('[API /api/admin/api-keys GET] Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'ACCESS DENIED: Super Administrator authority required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, id, data, updates, newSecret } = body;

    if (action === 'create') {
      if (!data || !data.name || !data.service) {
        return NextResponse.json({ error: 'Name and service identifier are required' }, { status: 400 });
      }
      const created = db.createApiKey(data, session);
      return NextResponse.json({
        success: true,
        message: `Registered credential for "${created.name}"`,
        key: {
          ...created,
          secretKey: maskSecret(created.secretKey),
          webhookSecret: maskSecret(created.webhookSecret),
        },
      });
    }

    if (action === 'update') {
      if (!id || !updates) {
        return NextResponse.json({ error: 'Key ID and updates payload required' }, { status: 400 });
      }
      const updated = db.updateApiKey(id, updates, session);
      return NextResponse.json({
        success: true,
        message: `Credentials for "${updated.name}" updated`,
        key: {
          ...updated,
          secretKey: maskSecret(updated.secretKey),
          webhookSecret: maskSecret(updated.webhookSecret),
        },
      });
    }

    if (action === 'rotate') {
      if (!id || !newSecret) {
        return NextResponse.json({ error: 'Key ID and new secret value required' }, { status: 400 });
      }
      const rotated = db.rotateApiKey(id, newSecret, session);
      return NextResponse.json({
        success: true,
        message: `Cryptographic rotation completed for "${rotated.name}"`,
        key: {
          ...rotated,
          secretKey: maskSecret(rotated.secretKey),
          webhookSecret: maskSecret(rotated.webhookSecret),
        },
      });
    }

    return NextResponse.json({ error: `Unknown action "${action}"` }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/admin/api-keys POST] Error:', error);
    return NextResponse.json({ error: error.message || 'Operation failed' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || session.role !== 'super_admin') {
      return NextResponse.json({ error: 'ACCESS DENIED: Super Administrator authority required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Key ID required' }, { status: 400 });

    const success = db.deleteApiKey(id, session);
    return NextResponse.json({ success, message: 'API credential entry successfully deleted' });
  } catch (error: any) {
    console.error('[API /api/admin/api-keys DELETE] Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete' }, { status: 400 });
  }
}
