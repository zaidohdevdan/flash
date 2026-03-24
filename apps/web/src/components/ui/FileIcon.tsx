import React from 'react';
import { 
    FileText, 
    FileSpreadsheet, 
    File as FileIconGeneric, 
    FileImage, 
    FileVideo, 
    FileArchive,
    Type
} from 'lucide-react';

interface FileIconProps {
    filename?: string;
    format?: string;
    className?: string;
    size?: number;
}

export const FileIcon: React.FC<FileIconProps> = ({ 
    filename = '', 
    format = '', 
    className = '', 
    size = 24 
}) => {
    const ext = (filename.split('.').pop() || format).toLowerCase();

    // Map extensions/formats to icons
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'image'].includes(ext)) {
        return <FileImage className={`${className} text-blue-500`} size={size} />;
    }

    if (['pdf'].includes(ext)) {
        return <FileText className={`${className} text-rose-500`} size={size} />;
    }

    if (['csv', 'xls', 'xlsx', 'sheet', 'spreadsheet'].includes(ext)) {
        return <FileSpreadsheet className={`${className} text-emerald-500`} size={size} />;
    }

    if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) {
        return <Type className={`${className} text-indigo-500`} size={size} />;
    }

    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return <FileArchive className={`${className} text-amber-500`} size={size} />;
    }

    if (['mp4', 'mov', 'avi', 'video'].includes(ext)) {
        return <FileVideo className={`${className} text-purple-500`} size={size} />;
    }

    return <FileIconGeneric className={`${className} text-slate-400`} size={size} />;
};
