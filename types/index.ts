export interface NoteObj {
    slug: string;
    title: string;
    content: string;
    tags: string[];
    lastEdited: string | Date;
    isArchived: boolean;
}