import type { StructureResolver } from 'sanity/structure';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Contenu du site')
    .items([
      S.documentTypeListItem('article').title('Actualités'),
      S.documentTypeListItem('evenement').title('Agenda'),
      S.documentTypeListItem('page').title('Pages'),
      S.documentTypeListItem('membreBureau').title('Le bureau'),
      S.documentTypeListItem('partenaire').title('Partenaires'),
      S.documentTypeListItem('contactUtile').title('Memento (contacts utiles)'),
      S.divider(),
      S.listItem()
        .title('Paramètres du site')
        .id('parametres')
        .child(S.document().schemaType('parametres').documentId('parametres')),
    ]);
