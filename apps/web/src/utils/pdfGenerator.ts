import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Report } from '../types';

export const generateReportsPDF = (reports: Report[], filterInfo: string) => {
    const doc = new jsPDF();
    const timestamp = format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });

    // Configurações de cores da marca Flash
    const colors = {
        primary: [37, 99, 235] as [number, number, number], // Blue 600
        dark: [2, 6, 23] as [number, number, number],    // Slate 950
        light: [100, 116, 139] as [number, number, number] // Slate 500
    };

    // Cabeçalho
    doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("FLASH", 14, 22);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("SISTEMA DE GESTÃO OPERACIONAL", 14, 30);

    doc.setFontSize(14);
    doc.text("Relatório Executivo", 140, 22);

    doc.setFontSize(8);
    doc.text(`Gerado em: ${timestamp}`, 140, 30);

    // Informações do Filtro
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Filtros Aplicados:", 14, 50);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.text(filterInfo, 14, 56);

    // Tabela de Dados
    const tableData = reports.map(report => [
        `#${report.id.slice(-6).toUpperCase()}`,
        format(new Date(report.createdAt), "dd/MM/yyyy", { locale: ptBR }),
        report.user.name,
        report.department?.name || 'Não atribuído',
        report.status,
        report.comment.length > 40 ? report.comment.substring(0, 37) + "..." : report.comment
    ]);

    autoTable(doc, {
        startY: 65,
        head: [['Protocolo', 'Data', 'Profissional', 'Departamento', 'Status', 'Resumo']],
        body: tableData,
        headStyles: {
            fillColor: colors.primary,
            textColor: 255,
            fontSize: 10,
            halign: 'center'
        },
        styles: {
            fontSize: 9,
            cellPadding: 4,
            overflow: 'linebreak'
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252]
        },
        margin: { top: 65 }
    });

    // Rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(colors.light[0], colors.light[1], colors.light[2]);
        doc.text(
            `Página ${i} de ${pageCount} - Flash Operations Platform`,
            105,
            285,
            { align: 'center' }
        );
    }

    // Salvar o arquivo
    const fileName = `Relatorio_Flash_${format(new Date(), "yyyyMMdd_HHmm")}.pdf`;
    doc.save(fileName);
};
