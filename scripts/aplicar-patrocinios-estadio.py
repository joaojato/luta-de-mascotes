from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / 'referencia/estadio/patrocinios-aprovados.png'
# Recortes das placas fornecidas pelo usuário; montagem sem redesenhar a arte.
plates = [((58, 84, 351, 147), (147, 647, 507, 725)),
          ((1137, 84, 1431, 147), (1469, 647, 1830, 725))]
reference = Image.open(source).convert('RGBA')
for relative in ['public/assets/cenarios/estadio/cenario.png',
                 'public/assets/cenarios/estadio/torcida/arquibancada-vazia.png']:
    path = root / relative
    image = Image.open(path).convert('RGBA')
    original = image.copy()
    for crop, target in plates:
        x, y, right, bottom = target
        plate = reference.crop(crop).resize((right-x, bottom-y), Image.Resampling.NEAREST)
        image.paste(plate, (x, y))
    # Nenhum pixel fora das duas placas pode mudar.
    for _, (x, y, right, bottom) in plates:
        original.paste(image.crop((x,y,right,bottom)), (x,y))
    assert original.tobytes() == image.tobytes()
    image.save(path)
Image.open(root / 'public/assets/cenarios/estadio/cenario.png').crop((0,620,2048,755)).save(root / 'referencia/estadio/patrocinios-conferencia.png')
