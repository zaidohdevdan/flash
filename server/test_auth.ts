
import { PrismaClient } from './src/generated/prisma';

const BASE_URL = 'http://localhost:3000';

async function testAuth() {
    console.log("1. Tentando Login...");
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'profissional@sistema.com',
            password: '123456'
        })
    });

    const loginData = await loginRes.json() as { token: string; user: any };
    if (!loginRes.ok) throw new Error(`Login falhou: ${JSON.stringify(loginData)}`);

    console.log("Login OK! Token recebido.");
    const token = loginData.token;

    console.log("2. Tentando Criar Relatório COM Token...");
    const formData = new FormData();
    formData.append("comment", "Relatório de Teste Automatizado");
    // Simulando arquivo
    const blob = new Blob(["conteudo"], { type: "text/plain" });
    formData.append("image", blob, "teste.txt");

    const reportRes = await fetch(`${BASE_URL}/reports`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    const reportData = await reportRes.json();

    if (reportRes.status === 201) {
        console.log("SUCESSO! Relatório criado:", reportData);

        // 3. Testar Atualização de Status (Precisa ser Supervisor)
        // Para simplificar, vamos usar o mesmo usuario se ele fosse supervisor, mas ele é profissional.
        // Vamos logar como supervisor rapidinho.
        console.log("3. Logando como Supervisor...");
        const supRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'super@sis.com', password: '123456' })
        });
        const supData = await supRes.json() as { token: string };
        const supToken = supData.token;

        console.log("4. Atualizando Status...");
        const reportId = (reportData as any).id;
        const updateRes = await fetch(`${BASE_URL}/reports/${reportId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supToken}`
            },
            body: JSON.stringify({ status: 'IN_REVIEW' })
        });

        const updateData = await updateRes.json();
        if (updateRes.ok) {
            console.log("SUCESSO! Status atualizado:", updateData);
        } else {
            console.error("FALHA ao atualizar status:", updateData);
        }

    } else {
        console.error("FALHA ao criar relatório:", reportData);
        process.exit(1);
    }
}

testAuth().catch(console.error);
