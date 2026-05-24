"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const crypto_util_1 = require("./common/crypto.util");
async function bootstrap() {
    if (process.env.SECRET_KEY) {
        (0, crypto_util_1.setSecretKey)(process.env.SECRET_KEY);
    }
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET'],
    });
    await app.listen(process.env.PORT || 3001);
    console.log(`BlackTeam API running on port ${process.env.PORT || 3001}`);
}
bootstrap();
//# sourceMappingURL=main.js.map