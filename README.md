# Le Sou des écoles de Boëge – site internet

Site de l’association de parents d’élèves de l’école publique de Boëge.
Il remplace les anciens sites WordPress.com et Weebly.

## Comment c’est fait

| Rôle | Outil | Coût |
|---|---|---|
| Pages du site | [Astro](https://astro.build) (site statique, dossier `src/`) | gratuit |
| Back-office des éditrices | [Sanity](https://www.sanity.io) (projet `4lcj5kde`), embarqué sur `/admin` | gratuit jusqu’à 20 utilisateurs |
| Hébergement | Cloudflare Pages | gratuit |
| Nom de domaine | `lesoudeboege.fr` | ≈ 10 €/an |

Le contenu (articles, pages, agenda, bureau, partenaires, paramètres) vit dans Sanity.
Le code (design, structure des pages) vit dans ce dépôt. Les deux sont indépendants :
on peut refaire le design sans toucher au contenu, et inversement.

## Pour les membres du bureau

1. Ouvrir `https://lesoudeboege.fr/admin` et se connecter avec l’adresse email invitée
   (ou un compte Google).
2. Dans **Actualités**, cliquer sur « + », remplir le titre, cliquer sur « Générer »
   à côté de l’adresse, ajouter une image, écrire le texte, glisser les PDF dans
   « Documents joints », puis **Publier**.
3. Le site se met à jour tout seul en une à deux minutes.

Les autres rubriques fonctionnent pareil : **Agenda** (une fiche par date, le prochain
événement s’affiche en grand sur l’accueil), **Pages** (textes libres), **Le bureau**,
**Partenaires**, **Memento** (une fiche par contact utile), et **Paramètres du site**
(email, Facebook, HelloAsso, phrase d’accueil, et le bloc **Cotisation** : montants,
bulletin PDF, texte, à quoi sert la cotisation).

Le **Bandeau d’annonce** (Paramètres du site) affiche un mot punaisé en haut de toutes les
pages tant que « Afficher le bandeau » est coché : annulation, report, rappel.

Avant de publier des photos, le script `scripts/photos/preparer-photos.py` les réduit,
retire les métadonnées (position GPS) et floute les visages. Relire le résultat avant
de les envoyer dans le Studio.

Le bloc **Galerie photos** (bouton « + » dans le texte) affiche une mosaïque de photos avec
agrandissement au clic ; on peut y glisser plusieurs photos d’un coup.

L’agenda est aussi disponible en calendrier : `/agenda.ics` (tout l’année, abonnable) et un
fichier par événement via « Ajouter à mon calendrier ».

Dans l’Agenda, la case **Date à confirmer** affiche une étiquette « date à confirmer »
sur le site : inutile de l’écrire dans la description.

Dans le texte d’un article ou d’une page, le bouton « + » propose, en plus des images et
documents, un bloc **Questions fréquentes** : une liste de questions/réponses qui s’affiche
en accordéon coloré sur le site.

Les pages Cotisation et Memento ont une mise en page dédiée : leur contenu se modifie
dans Paramètres du site et dans Memento, pas dans Pages. La page Nous contacter affiche
d’abord un encart WhatsApp (le lien du groupe s’obtient par email, il n’est jamais publié),
puis le contenu de la page « contact » de Pages.

Pour inviter une nouvelle personne : https://www.sanity.io/manage/project/4lcj5kde/members
(rôle « Editor »).

## Pour la personne qui s’occupe du code

```bash
npm install
cp .env.example .env        # puis renseigner SANITY_WRITE_TOKEN si besoin du script d’import
npm run dev                 # http://localhost:4321 et http://localhost:4321/admin
npm run build               # génère dist/
```

- `src/sanity/schemaTypes/` : les types de contenu (ce que voient les éditrices).
- `src/lib/sanity.ts` : les requêtes GROQ et les helpers de dates.
- `src/pages/`, `src/components/`, `src/styles/global.css` : le site lui-même.
- `scripts/import-wordpress.mjs` : import depuis l’ancien WordPress (idempotent,
  `--dry-run` pour simuler).

### Déploiement sur Cloudflare Pages

1. Pousser ce dépôt sur GitHub (compte de l’association).
2. Cloudflare Pages → « Create a project » → connecter le dépôt.
   Build command `npm run build`, output directory `dist`, Node 22.
3. Ajouter le domaine `lesoudeboege.fr` dans l’onglet Custom domains.
4. Dans Cloudflare Pages → Settings → Builds → « Deploy hooks », créer un hook,
   puis dans Sanity (https://www.sanity.io/manage/project/4lcj5kde/api#webhooks)
   créer un webhook qui appelle cette URL à chaque publication.
   C’est ce qui fait que « Publier » dans le Studio reconstruit le site.
5. Dans Sanity → API → CORS origins, ajouter `https://lesoudeboege.fr`
   (avec « allow credentials ») pour que `/admin` fonctionne en production.

### Passation

Changer l’email du propriétaire sur Sanity (Members), Cloudflare et le registrar
du domaine. Rien d’autre n’est lié à une personne.
