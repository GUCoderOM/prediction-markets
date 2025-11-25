import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'test@gmail.com';
    const password = 'testtest123';

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        console.log(`❌ User ${email} not found!`);
        return;
    }

    console.log(`✅ User found: ${user.email} (ID: ${user.id})`);
    console.log(`   Is Admin: ${user.isAdmin}`);
    console.log(`   Balance: ${user.balance}`);

    const match = await bcrypt.compare(password, user.password);

    if (match) {
        console.log('✅ Password match!');
        if (!user.isAdmin) {
            await prisma.user.update({
                where: { id: user.id },
                data: { isAdmin: true }
            });
            console.log('✅ Promoted to Admin.');
        }
    } else {
        console.log('❌ Password mismatch!');

        // Re-hash and update
        const newHash = await bcrypt.hash(password, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newHash, isAdmin: true }
        });
        console.log('🔄 Password reset and promoted to Admin.');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
