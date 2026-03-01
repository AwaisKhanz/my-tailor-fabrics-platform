"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const shared_types_1 = require("@tbms/shared-types");
const auth_decorators_1 = require("../decorators/auth.decorators");
let BranchGuard = class BranchGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(auth_decorators_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            return false;
        }
        if (user.role === shared_types_1.Role.SUPER_ADMIN) {
            const targetBranch = request.headers['x-branch-id'];
            request.branchId = targetBranch || null;
            return true;
        }
        if (!user.branchId) {
            throw new common_1.ForbiddenException('User is not assigned to any branch');
        }
        request.branchId = user.branchId;
        return true;
    }
};
exports.BranchGuard = BranchGuard;
exports.BranchGuard = BranchGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], BranchGuard);
//# sourceMappingURL=branch.guard.js.map