---
layout: post
title:  "Decorator in Python"
date:   2017-08-20 01:15:37 +0545
subtitle:   A python decorator is just a wrapper to an existing function to add more functionality to it.
categories: programming python
comments: true
header-img: img/post-headers/2017-08-20-decorator-in-python.jpg
---

A decorator in a python is a function that adds some functionalities to an existing function without altering the function
itself. That is, a wrapper to an existing function.

## Why do we need decorator?
Sometimes it happens to us that we want to add some features to an existing one. Like there is some kind of library function that you are using it.
However, you are not satisfied by its mechanism. So, you want to add some more features to it. But here's the dilemma. 

I. *You want to alter the existing feature itself. But you have to touch the codes in a third-party library.*  

II. *You want to touch your old codes. But you are afraid that you might brick the overall system in the process.*

III. *You can't just keep on changing old codes. You might have to do it at multiple locations where the old functions are being called.*


## Solution? Decorators
Decorator provides a means of altering or adding more codes to an existing function. But you don't really have to touch the old codes. 
It's like:

I. *You take a function.*

Let's take our old function.
```python
def old_function():
    pass
```

II. *Do whatever you'd like to do it to that function.*

Now let's wrap it.
```python
def wrapper(func):
    new_func = wrap(func)
    return new_func
```

III. *Return the improved version of that function.*

Finally, you can just alter `old_function` as:
```python
old_function = wrapper(old_function)
```

------

## Example : Pokemon
Say we have a function named `pokemon` that takes name and level of the pokemon.

```python
def pokemon(name="Pikachu", level=5):
    return "{0} --> {1}".format(name, level)
```

Now, above function is called at multiple locations or modules say:
```python
...
bulbasaur = pokemon("bulbasaur", 6)
# do something with bulbasaur
...
...
psyduck = pokemon("psyduck", 10)
```

**Let pokemons get evolved**  
After some time, we want to be able to make pokemon evolve perhaps.  
It can be done as:

```python
...
bulbasaur = pokemon("bulbasaur", 6)
bulbasaur_evolved = pokemon("bulbasaur", 12)
...
...
psyduck = pokemon("psyduck", 10)
psyduck_evolved = pokemon("psyduck", 15)
```

**Pretty annyoing, right?**  
We can't just go to multiple locations and keep on making changes accordingly.

**Oh wait! We can do it better**
```python
def evolve_pokemon(name="Pikachu", level=5):
    return "{0} --> {1}".format(name, level*2)
```
But this is rubbish. We don't want to make changes to original code.

**Here comes our hero decorator**  
Now, let's create a new function `evolve` that accepts the original function `pokemon` and wraps with with evolution
```python
EVOLUTION_MULTIPLIER = 2

def evolve(pokemon):
    def wrap(name, level):
        return pokemon(name, level * EVOLUTION_MULTIPLIER)
    return wrap

@evolve
def pokemon(name="Pikachu", level=5):
    return "{0} --> {1}".format(name, level)

```

The function `evolve` is now a decorator. The decorator then can be used using the `@` symbol with the function name.  
You should realize that the decorator `evolve` has an inner function `wrap` that basically performs the wrapping operation.
`wrap` returns a wrapped function. And `evolve` in turn returns its inner function `wrap`.

This is the fundamental principle of creating a decorator in python: *function inside function.*

**Hey! I want a decorator that accepts evolution similar to calling a function  like `@evolve(3)`.**  
No problem mate. This can be done by wrapping the `evolve` with yet another function.   

```python
def evolve(n):
    def inner(pokemon):
        def wrap(name, level):
            return pokemon(name, level * n)
        return wrap
    return inner

@evolve(3)
def pokemon(name="Pikachu", level=5):
    return "{0} --> {1}".format(name, level)
```

Did you notice anything? We took the first version of the decorator `evolve` and reanmed it to `inner`. 
And then we wrapped it with new function `evolve` that takes the numerical value `n`.

**You are seeing the pattern, right?**  
>Function inside a function inside a function inside a function.....  

You can basically take it to any level. But beyond 3 wrappers, the decorator doesn't really makes sense in terms of usecase.  
Decorators are possible in python because a function itself is an object in python and you can pass it around, kick its butt
and play around.

------
