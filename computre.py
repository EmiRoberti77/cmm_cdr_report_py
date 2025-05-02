import json
import random

fake_cmm_report = {
   "campaign_id": "CAMP123",
    "platforms": {
        "TV": {"reach": 10000000},
        "Meta": {"reach": 8000000},
        "Google": {"reach": 7000000}
    },
    "duplication_estimate": 0.16  # 16% overlap
}

def compute_net_reach(report):
  gross_reach = sum(p["reach"] for p in report["platforms"].values())
  deduplicated = int(gross_reach * report["duplication_estimate"])
  net_reach = gross_reach - deduplicated
  return {
    "gross_reach":gross_reach,
    "deduplicated":deduplicated,
    "net_reach":net_reach
  }
  

if __name__ == "__main__":
  result = compute_net_reach(fake_cmm_report)
  print(json.dumps(result, indent=2))