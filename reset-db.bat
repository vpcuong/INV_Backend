@echo off
set PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION=yes
npx prisma db push --force-reset
