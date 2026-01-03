---
layout: post
title:  "AOC-2018-Day-3: No Matter How You Slice It."
date:   2018-12-06 00:01:00 +0545
last_edited_on:   2018-12-06 00:03:20 +0545
categories: programming
tags: programming numpy python competetion
subtitle: "I have tried solving the problem using numpy and its vectorization task."
comments: true
header-img: "img/post-headers/2018-12-06-aoc-18.png"
---

It's been a couple of days (precisely 5 days) that [Advent of Code 2018](https://adventofcode.com/2018/) has started. 
As the site says:
> Advent of Code is an Advent calendar of small programming puzzles for a variety of skill sets and skill levels that can be solved in any programming language you like. People use them as a speed contest, interview prep, company training, university coursework, practice problems, or to challenge each other.

So, I have been solving a puzzle every day, with each puzzle becoming more challenging on successive days. This has kept me engergized 
this month.

Here, I am talking about a particular problem from **aoc-2018** intriguing because I had to use `numpy` to solve it.

You can read about this particular problem [here](https://adventofcode.com/2018/day/3)

## Approach
**Initial Setup**  

Here, I have made use of `numpy` library and its vectorization shit.  
```python
import numpy as np
```

The input is parsed as:
```python
claims = []
with open('input') as f:
    for line in f:
        line = line.strip()
        nums = map(int, re.findall(r'\d+', line))
        claims.append(tuple(nums))
```
The input is in the format as:
```bash
#1 @ 49,222: 19x20
#2 @ 162,876: 28x29
#3 @ 28,156: 17x18
...
...
```
So, I have used regular expression module `re` to extract digits.

`claims` become a list of tuple of format `(claim_number, x, y, w, h)`.

At first, I allocate **1000x1000** fabric matrix which is a zero matrix.  
After that, for each **claim**, I keep on using sub-matrices of that fabric matrix and increase the value by 1 successively. 

```python
fabric = np.zeros((1000, 1000))
for cn, x, y, w, h in claims:
    fabric[y:y+h, x:x+w] += 1
```


**Part 1**  
When each claim has been seen, I simply find the locations in the **1000x1000** fabric matrix where value is greater than 1. 
This is done by using `np.where` function which returns the boolean values for every location for the mentioned condition.  
And finally, I take the sum of that which gives total number of overlapping regions.  
This makes "sense" since any increment that exceeds `1` is telling us that the region is being incremented by another claim (sub matrix).  
```python
print(np.sum(np.where(fabric > 1, 1, 0)))
```


**Part 2**  
Like part 1, I loop through each claim one more time - each time extracting the sub-matrix (claim matrix) and finding the max value 
within the sub matrix. If the max value is exactly equal to 1 I simply know that the region is not being overlapped with any other claims.
```python
for cn, x, y, w, h in claims:
    claim = fabric[y:y+h, x:x+w]
        if claim.max() == 1:
            print(cn)
            break
```

## Final Code
```python
import re
import numpy as np

claims = []
overlaps = {}
with open('input') as f:
    for line in f:
        line = line.strip()
        nums = map(int, re.findall(r'\d+', line))
        claims.append(tuple(nums))

vectors = []
fabric = np.zeros((1000, 1000))
for cn, x, y, w, h in claims:
    fabric[y:y+h, x:x+w] += 1

# part 1
print(np.sum(np.where(fabric > 1, 1, 0)))


# part 2
for cn, x, y, w, h in claims:
    claim = fabric[y:y+h, x:x+w]
    if claim.max() == 1:
        print(cn)
        break
```

Cheers...

#programming #numpy #python #competetion
