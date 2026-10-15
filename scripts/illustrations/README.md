# Illustrations des articles

`illustrations.html` contient les trois illustrations dessinées en SVG dans le style
craie sur ardoise du site (opération dessins, calendrier de l'année, assemblée générale).

Pour en régénérer une en PNG 1200×800, ouvrir le fichier dans un navigateur et faire une
capture de l'élément `<svg>` voulu (ou utiliser Playwright : `page.$('#dessins').screenshot()`),
puis l'envoyer dans Sanity comme image principale de l'article.
