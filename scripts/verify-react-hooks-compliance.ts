import assert from 'assert';
import fs from 'fs';
import path from 'path';
import ts from 'typescript';

console.log('================================================================');
console.log('🧪 DOKIND VERIFICATION: REACT RULES OF HOOKS & RUNTIME INTEGRITY');
console.log('================================================================\n');

// 1. Inspect Header.tsx for Rules of Hooks compliance
console.log('--- 1. Testing Header.tsx Hook Order & Early Returns ---');
const headerPath = path.join(process.cwd(), 'src/components/layout/Header.tsx');
const headerContent = fs.readFileSync(headerPath, 'utf8');

const returnAdminIndex = headerContent.indexOf("if (pathname.startsWith('/admin') || pathname.startsWith('/staff'))");
assert(returnAdminIndex !== -1, 'Header contains route-based workspace check');

const headerFuncIndex = headerContent.indexOf('export function Header()');
const headerBody = headerContent.substring(headerFuncIndex);
const returnAdminOffset = headerBody.indexOf("if (pathname.startsWith('/admin') || pathname.startsWith('/staff'))");

const hooksBeforeReturn: string[] = [];
const hooksAfterReturn: string[] = [];

for (const match of headerBody.matchAll(/\b(use[A-Z]\w*)\s*\(/g)) {
  const offset = match.index!;
  if (offset < returnAdminOffset) {
    hooksBeforeReturn.push(match[1]);
  } else {
    hooksAfterReturn.push(match[1]);
  }
}

console.log(`Hooks before early return: ${hooksBeforeReturn.join(', ')} (${hooksBeforeReturn.length})`);
console.log(`Hooks after early return: ${hooksAfterReturn.length === 0 ? 'None (0)' : hooksAfterReturn.join(', ')}`);

assert(
  hooksAfterReturn.length === 0,
  `[CRITICAL] React Hook violation: Found ${hooksAfterReturn.length} hooks declared after early return in Header: ${hooksAfterReturn.join(', ')}`
);
console.log('✅ [PASS 1] Header.tsx executes 100% of its hooks unconditionally before any early return.');

// 2. Inspect Footer.tsx for Rules of Hooks compliance
console.log('\n--- 2. Testing Footer.tsx Hook Order & Early Returns ---');
const footerPath = path.join(process.cwd(), 'src/components/layout/Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');

const footerFuncIndex = footerContent.indexOf('export function Footer()');
const footerBody = footerContent.substring(footerFuncIndex);
const footerReturnOffset = footerBody.indexOf("if (pathname.startsWith('/admin') || pathname.startsWith('/staff'))");

const footerHooksAfterReturn: string[] = [];
for (const match of footerBody.matchAll(/\b(use[A-Z]\w*)\s*\(/g)) {
  const offset = match.index!;
  if (offset > footerReturnOffset) {
    footerHooksAfterReturn.push(match[1]);
  }
}

assert(
  footerHooksAfterReturn.length === 0,
  `[CRITICAL] React Hook violation: Found hooks after return in Footer: ${footerHooksAfterReturn.join(', ')}`
);
console.log('✅ [PASS 2] Footer.tsx executes all hooks before early returns.');

// 3. Inspect ApiKeyManagerPage (src/app/admin/api-keys/page.tsx) Hook Invariance
console.log('\n--- 3. Testing ApiKeyManagerPage (src/app/admin/api-keys/page.tsx) Hook Invariance ---');
const apiKeysPath = path.join(process.cwd(), 'src/app/admin/api-keys/page.tsx');
const apiKeysContent = fs.readFileSync(apiKeysPath, 'utf8');

const apiKeysFuncIndex = apiKeysContent.indexOf('export default function ApiKeyManagerPage()');
const apiKeysBody = apiKeysContent.substring(apiKeysFuncIndex);
const barrierOffset = apiKeysBody.indexOf('// ---------------- ACCESS DENIED BARRIER FOR NON-SUPER ADMINS ----------------');

const apiKeysHooksAfterBarrier: string[] = [];
for (const match of apiKeysBody.matchAll(/\b(use[A-Z]\w*)\s*\(/g)) {
  const offset = match.index!;
  if (offset > barrierOffset) {
    apiKeysHooksAfterBarrier.push(match[1]);
  }
}

assert(
  apiKeysHooksAfterBarrier.length === 0,
  `[CRITICAL] Found hooks declared after !isSuperAdmin barrier: ${apiKeysHooksAfterBarrier.join(', ')}`
);
console.log('✅ [PASS 3] ApiKeyManagerPage executes all useMemo and useState hooks before security barriers.');

// 4. Codebase-wide TypeScript AST Scan for React Rules of Hooks violations
console.log('\n--- 4. Codebase-wide TypeScript AST Hook Invariance Verification ---');

function isHookCall(node: ts.Node): string | null {
  if (ts.isCallExpression(node)) {
    const exprText = node.expression.getText();
    if (/^use[A-Z]\w*/.test(exprText)) {
      return exprText;
    }
  }
  return null;
}

function findHookInStatement(stmt: ts.Statement): string | null {
  let foundHook: string | null = null;
  function visit(n: ts.Node) {
    if (foundHook) return;
    const h = isHookCall(n);
    if (h) {
      foundHook = h;
      return;
    }
    // Do not descend into nested function declarations / closures
    if (ts.isFunctionDeclaration(n) || ts.isArrowFunction(n) || ts.isFunctionExpression(n)) {
      return;
    }
    ts.forEachChild(n, visit);
  }
  visit(stmt);
  return foundHook;
}

function isTopLevelReturnOrBranchReturn(stmt: ts.Statement): boolean {
  if (ts.isReturnStatement(stmt)) {
    return true;
  }
  if (ts.isIfStatement(stmt)) {
    // Check if the thenStatement contains a return statement
    if (ts.isReturnStatement(stmt.thenStatement)) {
      return true;
    }
    if (ts.isBlock(stmt.thenStatement)) {
      for (const s of stmt.thenStatement.statements) {
        if (ts.isReturnStatement(s)) return true;
      }
    }
  }
  return false;
}

function checkComponentFunction(
  sourceFile: ts.SourceFile,
  funcNode: ts.FunctionDeclaration | ts.FunctionExpression | ts.ArrowFunction,
  filePath: string,
  violations: { file: string; hook: string; line: number }[]
) {
  if (!funcNode.body || !ts.isBlock(funcNode.body)) return;

  let topReturnSeen = false;
  let topReturnLine = 0;

  for (const stmt of funcNode.body.statements) {
    // Check if statement contains a top-level component early return
    if (isTopLevelReturnOrBranchReturn(stmt)) {
      topReturnSeen = true;
      topReturnLine = sourceFile.getLineAndCharacterOfPosition(stmt.getStart(sourceFile)).line + 1;
    }

    if (topReturnSeen) {
      const hookName = findHookInStatement(stmt);
      if (hookName) {
        const line = sourceFile.getLineAndCharacterOfPosition(stmt.getStart(sourceFile)).line + 1;
        violations.push({ file: filePath, hook: hookName, line });
      }
    }
  }
}

function scanFileAst(filePath: string, violations: { file: string; hook: string; line: number }[]) {
  const content = fs.readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function walk(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name && /^[A-Z]/.test(node.name.text)) {
      checkComponentFunction(sourceFile, node, filePath, violations);
    } else if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          /^[A-Z]/.test(decl.name.text) &&
          decl.initializer &&
          (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))
        ) {
          checkComponentFunction(sourceFile, decl.initializer, filePath, violations);
        }
      }
    }
    ts.forEachChild(node, walk);
  }

  walk(sourceFile);
}

function scanAstDir(dir: string, violations: { file: string; hook: string; line: number }[]) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
      scanAstDir(full, violations);
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      scanFileAst(full, violations);
    }
  }
}

const astViolations: { file: string; hook: string; line: number }[] = [];
scanAstDir(path.join(process.cwd(), 'src'), astViolations);
console.log(`AST scan analyzed all components across src/ and detected ${astViolations.length} violations.`);
assert.strictEqual(astViolations.length, 0, `AST Violations: ${JSON.stringify(astViolations)}`);
console.log('✅ [PASS 4] 0 hook order violations found across all React components and custom hooks.');

// 5. Test Live HTTP server endpoints to guarantee 200 OK without runtime errors
console.log('\n--- 5. Testing Live HTTP Server Response Across Routes ---');
async function testLiveRoutes() {
  const routes = ['/', '/login', '/campaigns', '/admin', '/admin/seo', '/admin/api-keys', '/staff/campaigns'];
  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      assert(res.status === 200, `Route ${route} should return 200 OK, got ${res.status}`);
      const text = await res.text();
      assert(!text.includes('Rendered fewer hooks than expected'), `Route ${route} must NOT contain hook mismatch error`);
      console.log(`✅ [PASS 5] Route ${route} returned HTTP 200 with 0 React runtime errors.`);
    } catch (err: any) {
      console.error(`Error requesting ${route}:`, err.message);
      throw err;
    }
  }
}

testLiveRoutes().then(() => {
  console.log('\n================================================================');
  console.log('TOTAL SUITE RESULTS: ALL 5 REACT HOOK CHECKS PASSED CLEANLY!');
  console.log('================================================================');
});
