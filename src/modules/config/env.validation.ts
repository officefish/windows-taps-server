import { plainToInstance, ClassTransformOptions } from 'class-transformer'
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  //IsIP,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator'

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsString()
  API_VERSION: string

  @IsString()
  DATABASE_URL: string

  @IsNumber()
  DB_PASSWORD: number

  @IsString()
  DB_USERNAME: string

  @IsEnum(Environment)
  NODE_ENV: Environment

  @IsString()
  SMTP_HOST: string

  @IsNumber()
  SMTP_PORT: number

  @IsBoolean()
  SMTP_USE_TLS: boolean

  @IsBoolean()
  SMTP_POOL: boolean

  @IsString()
  SMTP_LOGIN: string

  @IsString()
  SMTP_PASSWORD: string

  @IsEmail()
  FROM_EMAIL: string

  @IsString()
  SMTP_SENDER: string

  @IsString()
  SMTP_SUBJECT: string

  @IsString()
  JWT_SIGNATURE: string

  @IsNumber()
  JWT_SALT_LENGTH: number

  @IsString()
  DEV_HOST: string

  @IsString()
  PROD_HOST: string

  @IsNumber()
  DEV_PORT: number

  @IsNumber()
  PROD_PORT: number

  @IsString()
  COOKIE_SIGNATURE: string

  @IsBoolean()
  COOKIE_HTTPONLY: boolean

  @IsBoolean()
  COOKIE_SECURE: boolean

  @IsString()
  COOKIE_PATH: string

  @IsString()
  SESSION_SIGNATURE: string

  @IsNumber()
  SESSION_TOKEN_LENGTH: number

  @IsNumber()
  SESSION_MAX_AGE: number

  @IsString()
  AVATAR_URL: string

  @IsString()
  COVER_URL: string
}

export function validate(config: Record<string, unknown>) {
  const transformOptions = {
    enableImplicitConversion: true,
  } satisfies ClassTransformOptions
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    config,
    transformOptions,
  )
  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }
  return validatedConfig
}