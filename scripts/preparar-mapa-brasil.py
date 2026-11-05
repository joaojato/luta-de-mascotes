"""Malha simplificada do IBGE, compactada para uso local na selecao de lutadores."""
from pathlib import Path
from urllib.request import urlopen
import gzip
import json

FONTE='https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?intrarregiao=UF&formato=application/vnd.geo+json&qualidade=minima'
def baixar(url):
    with urlopen(url,timeout=60) as r: raw=r.read()
    return json.loads(gzip.decompress(raw) if raw[:2]==b'\x1f\x8b' else raw)
def area(ring):
    return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:]))/2
def dentro(x,y,ring):
    inside=False
    for a,b in zip(ring,ring[1:]):
        if (a[1]>y)!=(b[1]>y) and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]: inside=not inside
    return inside
def centro(ring):
    a=area(ring)
    x=sum((p[0]+q[0])*(p[0]*q[1]-q[0]*p[1]) for p,q in zip(ring,ring[1:]))/(6*a)
    y=sum((p[1]+q[1])*(p[0]*q[1]-q[0]*p[1]) for p,q in zip(ring,ring[1:]))/(6*a)
    if dentro(x,y,ring): return [round(x,3),round(y,3)]
    xs,ys=zip(*ring);candidates=[]
    for i in range(1,30):
        for j in range(1,30):
            px=min(xs)+(max(xs)-min(xs))*i/30;py=min(ys)+(max(ys)-min(ys))*j/30
            if dentro(px,py,ring):candidates.append((px,py))
    p=min(candidates,key=lambda p:(p[0]-x)**2+(p[1]-y)**2)
    return [round(p[0],3),round(p[1],3)]
root=Path(__file__).resolve().parents[1]
malha=baixar(FONTE)
ufs={str(e['id']):e for e in baixar('https://servicodados.ibge.gov.br/api/v1/localidades/estados')}
estados=[]
for f in malha['features']:
    uf=ufs[f['properties']['codarea']];g=f['geometry']
    rings=[p[0] for p in g['coordinates']] if g['type']=='MultiPolygon' else [g['coordinates'][0]]
    ring=max(rings,key=lambda r:abs(area(r)))
    estados.append({'uf':uf['sigla'],'nome':uf['nome'],'regiao':uf['regiao']['nome'],'centro':centro(ring),'contorno':[[round(x,3),round(y,3)] for x,y,*_ in ring]})
destino=root/'src/game/mapa/brasil-estados.json';destino.parent.mkdir(parents=True,exist_ok=True)
destino.write_text(json.dumps({'fonte':FONTE,'estados':estados},ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(f'{len(estados)} UFs; {destino.stat().st_size} bytes; fonte IBGE.')
