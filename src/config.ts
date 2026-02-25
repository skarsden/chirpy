import { MigrationConfig } from "drizzle-orm/migrator";

type Config = {
    api: APIConfig;
    db: DBConfig;
    jwt: JwtConfig;
}

type APIConfig = {
    fileserverHits: number;
    port: number;
    platform: string;
};

type DBConfig = {
    url: string;
    migrationConfig: MigrationConfig;
}

type JwtConfig = {
    defaultDuration: number,
    issuer: string,
    secret: string
}

process.loadEnvFile();

const migrationConfig: MigrationConfig = {
    migrationsFolder: "./src/db/sql",
}

export const config: Config = { 
    api: {
        fileserverHits: 0,
        port: Number(envOrThrow("PORT")),
        platform: envOrThrow("PLATFORM")
    },
    db: {
        url: envOrThrow("DB_URL"),
        migrationConfig: migrationConfig,
    },
    jwt: {
        defaultDuration: 3600,
        secret: envOrThrow("SECRET"),
        issuer: "chirpy"
    }
 };


export function envOrThrow(key: string) {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Environment variable ${key} is not set`);
    }
    return value;
}
