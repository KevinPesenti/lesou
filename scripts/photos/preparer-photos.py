"""
Prépare des photos pour le site : redimensionne (2400 px max), retire les
métadonnées EXIF (dont la position GPS) et floute les visages.

Usage :
  python3 scripts/photos/preparer-photos.py dossier_source dossier_sortie [--sans-flou]

Dépendances : pip install --user pillow opencv-python-headless
Le modèle de détection (yunet.onnx) vient du dépôt opencv_zoo.
Relisez toujours le résultat : un visage de profil ou tourné peut échapper
au détecteur. Dans ce cas, ajoutez une zone à la main dans ZONES_MANUELLES.
"""
import sys, os
import cv2, numpy as np
from PIL import Image, ImageOps

ICI = os.path.dirname(os.path.abspath(__file__))
# { 'nom-de-fichier.jpg': [(x, y, largeur, hauteur), ...] } en pixels de l'image réduite
ZONES_MANUELLES: dict[str, list[tuple[int, int, int, int]]] = {}

def detecter(img):
    det = cv2.FaceDetectorYN.create(os.path.join(ICI, 'yunet.onnx'), '', (320, 320), score_threshold=0.5, nms_threshold=0.3, top_k=500)
    boxes = []
    for scale in (1.0, 0.5):
        im = cv2.resize(img, None, fx=scale, fy=scale) if scale != 1 else img
        det.setInputSize((im.shape[1], im.shape[0]))
        _, faces = det.detect(im)
        if faces is not None:
            for x, y, w, h, *_r, score in faces:
                boxes.append((int(x/scale), int(y/scale), int(w/scale), int(h/scale), float(score)))
    keep = []
    for b in sorted(boxes, key=lambda b: -b[4]):
        if all(not (abs(b[0]-k[0]) < k[2]*0.5 and abs(b[1]-k[1]) < k[3]*0.5) for k in keep):
            keep.append(b)
    return [b[:4] for b in keep]

def flouter(img, boxes):
    h, w = img.shape[:2]
    out = img.copy()
    for (x, y, bw, bh) in boxes:
        cx, cy = x + bw/2, y + bh/2 - bh*0.05
        rw, rh = bw*0.85, bh*0.9
        x0, y0 = max(0, int(cx-rw)), max(0, int(cy-rh)); x1, y1 = min(w, int(cx+rw)), min(h, int(cy+rh))
        if x1 <= x0 or y1 <= y0: continue
        zone = out[y0:y1, x0:x1]
        k = max(9, (int(max(bw, bh)/3)//2)*2+1)
        petit = cv2.resize(zone, (max(2, zone.shape[1]//12), max(2, zone.shape[0]//12)))
        flou = cv2.GaussianBlur(cv2.resize(petit, (zone.shape[1], zone.shape[0]), interpolation=cv2.INTER_NEAREST), (k, k), 0)
        masque = np.zeros(zone.shape[:2], np.uint8)
        cv2.ellipse(masque, (zone.shape[1]//2, zone.shape[0]//2), (zone.shape[1]//2, zone.shape[0]//2), 0, 0, 360, 255, -1)
        masque = cv2.GaussianBlur(masque, (k, k), 0).astype(float)[..., None]/255
        out[y0:y1, x0:x1] = (flou*masque + zone*(1-masque)).astype(np.uint8)
    return out

def main(src, dst, flou=True):
    os.makedirs(dst, exist_ok=True)
    for nom in sorted(os.listdir(src)):
        if not nom.lower().endswith(('.jpg', '.jpeg', '.png', '.heic', '.webp')): continue
        im = ImageOps.exif_transpose(Image.open(os.path.join(src, nom))).convert('RGB')
        im.thumbnail((2400, 2400))
        sortie = os.path.join(dst, os.path.splitext(nom)[0] + '.jpg')
        im.save(sortie, 'JPEG', quality=85, optimize=True, progressive=True)  # sans EXIF
        if flou:
            img = cv2.imread(sortie)
            boxes = detecter(img) + ZONES_MANUELLES.get(nom, [])
            cv2.imwrite(sortie, flouter(img, boxes), [cv2.IMWRITE_JPEG_QUALITY, 85, cv2.IMWRITE_JPEG_PROGRESSIVE, 1])
            print(f'{nom}: {im.size[0]}x{im.size[1]}, {len(boxes)} visage(s) flouté(s)')
        else:
            print(f'{nom}: {im.size[0]}x{im.size[1]}')

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    if len(args) != 2:
        print(__doc__); sys.exit(1)
    main(args[0], args[1], flou='--sans-flou' not in sys.argv)
