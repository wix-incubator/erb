#!/usr/bin/env bash

# .nvmrc
bidev forall 'printf "4.2.6\n" > .nvmrc'

# .npmignore
bidev forall 'printf "test\ntarget\n" > .npmignore'