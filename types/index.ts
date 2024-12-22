export interface NoteObj {
    slug: string;
    title: string;
    content: string;
    tags: string[];
    lastEdited: string | Date;
    isArchived: boolean;
}

export interface ThemeOption {
    title: string;
    desc: string;
    icon: string;
    value: string;
}