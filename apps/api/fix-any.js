const fs = require('fs');
const fixAny = (path, replacements) => {
    let content = fs.readFileSync(path, 'utf8');
    replacements.forEach(([regex, repl]) => {
        content = content.replace(regex, repl);
    });
    fs.writeFileSync(path, content);
};

fixAny('src/orders/orders.controller.ts', [
    [/dto: any/g, 'dto: Record<string, unknown>']
]);

fixAny('src/reports/reports.controller.ts', [
    [/@Res\(\) res: any/g, '@Res() res: import(\'express\').Response']
]);

fixAny('src/reports/export.service.ts', [
    [/where: any/g, 'where: Record<string, unknown>'],
    [/dateFilter: any/g, 'dateFilter: Record<string, unknown>']
]);

fixAny('src/orders/orders.service.ts', [
    [/\(orderBy as any\)/g, '(orderBy as Record<string, string>)'],
    [/filters\.status as any/g, 'filters.status as import(\'@tbms/shared-types\').OrderStatus'],
    [/dto: any,/g, 'dto: Record<string, unknown>,'],
    [/\(dto\.status as any\)/g, '(dto.status as import(\'@tbms/shared-types\').OrderStatus)']
]);

fixAny('src/orders/receipt.service.tsx', [
    [/order: any/g, 'order: Record<string, unknown> & { items?: Record<string, unknown>[] }'],
    [/item: any/g, 'item: Record<string, unknown>'],
    [/\} as any/g, '} as unknown as React.ReactElement']
]);

fixAny('src/common/interceptors/audit.interceptor.ts', [
    [/Observable<any>/g, 'Observable<unknown>'],
    [/oldValue: any/g, 'oldValue: unknown'],
    [/err: any/g, 'err: unknown']
]);

fixAny('src/scheduler/scheduler.service.ts', [
    [/tx: any/g, 'tx: import(\'@prisma/client\').Prisma.TransactionClient']
]);

fixAny('src/auth/auth.module.ts', [
    [/as any/g, 'as string']
]);

fixAny('src/expenses/expenses.service.ts', [
    [/\(orderBy as any\)/g, '(orderBy as Record<string, string>)']
]);

fixAny('src/payments/payments.service.ts', [
    [/\(orderBy as any\)/g, '(orderBy as Record<string, string>)']
]);

fixAny('src/customers/dto/upsert-measurement.dto.ts', [
    [/Record<string, any>/g, 'Record<string, unknown>']
]);

fixAny('src/payments/weekly-pdf.service.tsx', [
    [/data: any\[\]/g, 'data: Record<string, unknown>[]'],
    [/as any\[\]/g, 'as Record<string, unknown>[]'],
    [/\} as any/g, '} as unknown as React.ReactElement']
]);

fixAny('src/payments/payments.controller.ts', [
    [/@Res\(\) res: any/g, '@Res() res: import(\'express\').Response'],
    [/data as any\[\]/g, 'data as Record<string, unknown>[]']
]);

fixAny('src/auth/auth.controller.ts', [
    [/\(req\.user as any\)/g, '(req.user as { refreshToken?: string })']
]);

fixAny('src/auth/strategies/jwt-refresh.strategy.ts', [
    [/payload: any/g, 'payload: Record<string, unknown>']
]);

console.log('Done');
