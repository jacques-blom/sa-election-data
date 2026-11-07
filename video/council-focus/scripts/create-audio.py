"""An original quiet instrumental bed. No samples, speech, or third-party music."""
import math, wave, struct
from pathlib import Path
rate=48000
duration=36
chords=[[146.832,220,261.626,329.628],[116.541,174.614,220,261.626],[130.813,196,246.942,293.665],[146.832,220,261.626,329.628]]
notes=[440,523.251,659.255,587.33,523.251,440,349.228,440,523.251,659.255,587.33,440,392,493.883,587.33,523.251]
target=Path(__file__).resolve().parents[1]/'public/audio/council-focus.wav'
target.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(target),'wb') as f:
    f.setparams((2,2,rate,0,'NONE','not compressed'))
    buf=bytearray()
    for i in range(rate*duration):
        t=i/rate
        master=min(1,t/1.5,max(0,(duration-t)/2))
        left=right=0.
        for ci,chord in enumerate(chords):
            u=t-ci*9
            if 0<=u<11:
                env=min(1,u/2,max(0,(11-u)/2))*.018
                for n,hz in enumerate(chord):
                    left+=env*math.sin(2*math.pi*hz*t+.2*n)*(1+.1*math.sin(t*.5))
                    right+=env*math.sin(2*math.pi*(hz*1.0008)*t+.2*n)
        for ni,hz in enumerate(notes):
            u=t-(2+ni*1.9)
            if 0<=u<4:
                env=min(1,u/.015)*math.exp(-u*1.7)*.035
                note=env*(math.sin(2*math.pi*hz*u)+.22*math.sin(2*math.pi*hz*2*u)*math.exp(-u*2))
                left+=note*(.8 if ni%2 else 1)
                right+=note*(1 if ni%2 else .8)
        buf.extend(struct.pack('<hh',int(left*master*32767),int(right*master*32767)))
        if len(buf)>192000:f.writeframesraw(buf);buf.clear()
    f.writeframes(buf)
print(target)
