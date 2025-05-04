import json
import random

def generate_report(provider):
  return {
    "provider":provider,
    "reach":random.random(5_000_000, 15_000_000)
  }