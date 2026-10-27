import { db } from '../src/lib/db';
import { UserRole, User } from '../src/lib/types';
import fs from 'fs';
import path from 'path';

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${testName}${details ? ` - ${details}` : ''}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 DOKIND VERIFICATION: EMPLOYEE MAXIMUM 2 ROLES CONSTRAINT');
  console.log('================================================================\n');

  const superAdmin = { id: 'usr-admin-1', name: 'Chief Administrator', role: 'super_admin' as UserRole };

  // TEST 1: Single role creation succeeds
  try {
    const singleEmp = db.createEmployee(
      {
        name: 'Aarav Gupta Single',
        email: 'aarav.single832467.${Date.now()}.${Math.floor(Math.random()*10000)}@dokind.org.in',
        role: 'lead_generator',
        department: 'Campaign Outreach',
        jobTitle: 'Lead Generator',
      },
      superAdmin
    );

    assert(
      singleEmp.user.role === 'lead_generator' &&
        singleEmp.user.secondaryRole === undefined &&
        Array.isArray(singleEmp.user.roles) &&
        singleEmp.user.roles.length === 1 &&
        singleEmp.user.roles[0] === 'lead_generator',
      'Test 1: Single role employee creation generates clean 1-role contract',
      `Got roles: ${JSON.stringify(singleEmp.user.roles)}`
    );
  } catch (err: unknown) {
    assert(false, 'Test 1: Single role creation failed unexpectedly', (err as Error).message);
  }

  // TEST 2: Dual role creation succeeds (Max 2 roles)
  try {
    const dualEmp = db.createEmployee(
      {
        name: 'Pooja Verma Dual',
        email: 'pooja.dual.${Date.now()}.${Math.floor(Math.random()*10000)}@dokind.org.in',
        role: 'lead_generator',
        secondaryRole: 'content_writer',
        department: 'Outreach & Editorial',
        jobTitle: 'Lead Generator & Story Writer',
      },
      superAdmin
    );

    assert(
      dualEmp.user.role === 'lead_generator' &&
        dualEmp.user.secondaryRole === 'content_writer' &&
        Array.isArray(dualEmp.user.roles) &&
        dualEmp.user.roles.length === 2 &&
        dualEmp.user.roles[0] === 'lead_generator' &&
        dualEmp.user.roles[1] === 'content_writer',
      'Test 2: Dual role employee creation succeeds with primary and secondary roles assigned',
      `Got roles: ${JSON.stringify(dualEmp.user.roles)}`
    );
  } catch (err: unknown) {
    assert(false, 'Test 2: Dual role creation failed unexpectedly', (err as Error).message);
  }

  // TEST 3: Attempting to create employee with > 2 roles in roles array throws validation error
  try {
    let threw = false;
    try {
      db.createEmployee(
        {
          name: 'Triple Role Candidate',
          email: 'triple.fail.${Date.now()}.${Math.floor(Math.random()*10000)}@dokind.org.in',
          role: 'lead_generator',
          roles: ['lead_generator', 'content_writer', 'reviewer'] as UserRole[],
          department: 'Overloaded',
          jobTitle: 'Triple Hat',
        },
        superAdmin
      );
    } catch (err: unknown) {
      threw = true;
      assert(
        (err as Error).message.includes('more than 2 roles'),
        'Test 3: Attempting to provision employee with 3 roles throws validation error',
        `Error caught: ${(err as Error).message}`
      );
    }
    if (!threw) {
      assert(false, 'Test 3: System allowed provisioning an employee with 3 roles (VIOLATION)');
    }
  } catch (err: unknown) {
    assert(false, 'Test 3 execution failed', (err as Error).message);
  }

  // TEST 4: Updating an employee to assign a 2nd role succeeds
  try {
    const empToUpdate = db.createEmployee(
      {
        name: 'Ramesh Updatable',
        email: 'ramesh.update.${Date.now()}.${Math.floor(Math.random()*10000)}@dokind.org.in',
        role: 'content_writer',
      },
      superAdmin
    );

    const updated = db.updateEmployee(
      empToUpdate.user.id,
      {
        secondaryRole: 'lead_generator',
      },
      superAdmin
    );

    assert(
      updated.role === 'content_writer' &&
        updated.secondaryRole === 'lead_generator' &&
        updated.roles?.length === 2 &&
        updated.roles.includes('content_writer') &&
        updated.roles.includes('lead_generator'),
      'Test 4: Updating single-role employee to dual-role succeeds smoothly',
      `Updated roles: ${JSON.stringify(updated.roles)}`
    );
  } catch (err: unknown) {
    assert(false, 'Test 4 execution failed', (err as Error).message);
  }

  // TEST 5: Attempting to update employee with > 2 roles is rejected
  try {
    const emp = db.createEmployee(
      {
        name: 'Strict Limit Target',
        email: 'limit.target832467.${Date.now()}.${Math.floor(Math.random()*10000)}@dokind.org.in',
        role: 'reviewer',
      },
      superAdmin
    );

    let threw = false;
    try {
      db.updateEmployee(
        emp.user.id,
        {
          roles: ['reviewer', 'finance', 'marketer'] as UserRole[],
        },
        superAdmin
      );
    } catch (err: unknown) {
      threw = true;
      assert(
        (err as Error).message.includes('more than 2 roles'),
        'Test 5: updateEmployee throws validation error when > 2 roles provided in updates',
        `Error: ${(err as Error).message}`
      );
    }
    if (!threw) {
      assert(false, 'Test 5: System allowed updating employee to 3 roles (VIOLATION)');
    }
  } catch (err: unknown) {
    assert(false, 'Test 5 execution failed', (err as Error).message);
  }

  // TEST 6: Removing secondaryRole returns employee to single role state
  try {
    const empWithTwo = db.createEmployee(
      {
        name: 'Meena Dual Remove',
        email: 'meena.remove832467.${Date.now()}.${Math.floor(Math.random()*10000)}@dokind.org.in',
        role: 'lead_generator',
        secondaryRole: 'content_writer',
      },
      superAdmin
    );

    const cleared = db.updateEmployee(
      empWithTwo.user.id,
      {
        secondaryRole: undefined,
        roles: ['lead_generator'],
      },
      superAdmin
    );

    assert(
      cleared.role === 'lead_generator' &&
        cleared.secondaryRole === undefined &&
        cleared.roles?.length === 1,
      'Test 6: Removing secondary role returns employee to single role cleanly',
      `Roles: ${JSON.stringify(cleared.roles)}, secondaryRole: ${cleared.secondaryRole}`
    );
  } catch (err: unknown) {
    assert(false, 'Test 6 execution failed', (err as Error).message);
  }

  // TEST 7: Duplicate role assigned as secondaryRole is deduplicated
  try {
    const dupEmp = db.createEmployee(
      {
        name: 'Duplicate Role Test',
        email: 'dup.role832467.${Date.now()}.${Math.floor(Math.random()*10000)}@dokind.org.in',
        role: 'reviewer',
        secondaryRole: 'reviewer', // duplicate
      },
      superAdmin
    );

    assert(
      dupEmp.user.role === 'reviewer' &&
        dupEmp.user.secondaryRole === undefined &&
        dupEmp.user.roles?.length === 1,
      'Test 7: Duplicate primary and secondary role is sanitized to 1 role',
      `Roles: ${JSON.stringify(dupEmp.user.roles)}`
    );
  } catch (err: unknown) {
    assert(false, 'Test 7 execution failed', (err as Error).message);
  }

  // TEST 8: getEmployees includes employees with secondary staff role
  try {
    const employees = db.getEmployees();
    const hasLeadGen = employees.some((e) => e.role === 'lead_generator' || e.secondaryRole === 'lead_generator');
    const hasContentWriter = employees.some((e) => e.role === 'content_writer' || e.secondaryRole === 'content_writer');

    assert(
      hasLeadGen && hasContentWriter,
      'Test 8: db.getEmployees() correctly tracks staff members with primary or secondary roles',
      `Found lead_generator: ${hasLeadGen}, content_writer: ${hasContentWriter}`
    );
  } catch (err: unknown) {
    assert(false, 'Test 8 execution failed', (err as Error).message);
  }

  // TEST 9: UI Files inspection - Team New Page enforces 2-role max
  try {
    const teamNewContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/team/new/page.tsx'),
      'utf8'
    );
    assert(
      teamNewContent.includes('selectedRoles.length >= 2') &&
        teamNewContent.includes('Maximum 2 roles reached') &&
        teamNewContent.includes('Primary') &&
        teamNewContent.includes('Secondary'),
      'Test 9: Team New page renders interactive multi-role toggles and enforces max 2 roles'
    );
  } catch (err: unknown) {
    assert(false, 'Test 9 execution failed', (err as Error).message);
  }

  // TEST 10: UI Files inspection - Team Edit Page enforces 2-role max
  try {
    const teamEditContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/team/[id]/edit/page.tsx'),
      'utf8'
    );
    assert(
      teamEditContent.includes('secondaryRole') &&
        teamEditContent.includes('2 / 2 Roles Assigned (Max)') &&
        teamEditContent.includes('Primary Role') &&
        teamEditContent.includes('Secondary Role'),
      'Test 10: Team Edit page allows selecting up to 2 roles with maximum constraint'
    );
  } catch (err: unknown) {
    assert(false, 'Test 10 execution failed', (err as Error).message);
  }

  // TEST 11: UI Files inspection - Team Table Page displays both role badges
  try {
    const teamTableContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/team/page.tsx'),
      'utf8'
    );
    assert(
      teamTableContent.includes('emp.secondaryRole') &&
        teamTableContent.includes('Primary Role (Click to manage roles)') &&
        teamTableContent.includes('Secondary Role (Click to manage roles)'),
      'Test 11: Team Roster table displays both Primary and Secondary role badges'
    );
  } catch (err: unknown) {
    assert(false, 'Test 11 execution failed', (err as Error).message);
  }

  // TEST 12: Admin Layout RBAC checks both roles
  try {
    const layoutContent = fs.readFileSync(
      path.join(process.cwd(), 'src/app/admin/layout.tsx'),
      'utf8'
    );
    assert(
      layoutContent.includes('user?.secondaryRole') &&
        layoutContent.includes('evaluatedRoles.some((r) => canRoleAccess(r, item))'),
      'Test 12: Admin layout evaluates RBAC permissions across all assigned roles'
    );
  } catch (err: unknown) {
    assert(false, 'Test 12 execution failed', (err as Error).message);
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`TOTAL SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('----------------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
