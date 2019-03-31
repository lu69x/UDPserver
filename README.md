# UDP Server
## Communication formatting detail.  
> Version 0.8.1 :  
    - Data format 8 bytes  
    - Support 65,535 node  
    - Add routing table  
    - Add query API


**All data use in `HEXADECIMAL`(Character) format**

Data format:  
- Data lenght 8 bytes
- | Direction 2 bytes | Target 4 bytes | Command 2 bytes |
---

## Direction
Direction code||
:-:|-
NS|Node => Server
NC|Node => Client
SN|Server => Node
SC|Server => Client
CN|Client => Node
CS|Client => Server
---

## Traget
> This code is support `65,535` node  
Because, This code base on HEX, But define by character.

Traget code use only define node.  
Example:
 - `0000 Don't use. Because 0000 casting all node`
 - 0001 is Node 1 (Start at node 1)
 - 02AE is Node 686
 - C00A is Node 49,162
 - FFFF is Node 65,536 (End at node 65,536)
---

## Command
Code|Meaning
-|-
00|Force turn off.
11|Force turn on.
FF|Restart node.