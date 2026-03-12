#!/usr/bin/env python3

import argparse
import json
from urllib.parse import parse_qs, urlsplit

from bs4 import BeautifulSoup

from icrawler.builtin.google import GoogleFeeder, GoogleParser
from icrawler.utils import ProxyPool, Session, Signal


def build_candidates(query: str, max_num: int) -> list[dict[str, str | None]]:
    signal = Signal()
    signal.set(feeder_exited=False, parser_exited=False, reach_max_num=False)
    session = Session(ProxyPool())

    feeder = GoogleFeeder(1, signal, session)
    parser = GoogleParser(1, signal, session)
    feeder.feed(keyword=query, offset=0, max_num=max_num)

    seen_pages: set[str] = set()
    seen_images: set[str] = set()
    candidates: list[dict[str, str | None]] = []

    while not feeder.out_queue.empty() and len(candidates) < max_num:
      search_url = feeder.out_queue.get()
      base_url = "{0.scheme}://{0.netloc}".format(urlsplit(search_url))
      response = session.get(search_url, timeout=10, headers={"Referer": base_url})

      soup = BeautifulSoup(response.text, "html.parser")
      thumbnails = []
      for image in soup.find_all("img"):
        src = image.get("src")
        if isinstance(src, str) and src.startswith("https://encrypted-tbn0.gstatic.com/images"):
          thumbnails.append(src)

      source_pages = []
      for anchor in soup.find_all("a"):
        href = anchor.get("href")
        if not isinstance(href, str) or not href.startswith("/url?"):
          continue
        target = parse_qs(urlsplit(href).query).get("q", [None])[0]
        if not target or not target.startswith(("http://", "https://")):
          continue
        if target in seen_pages:
          continue
        seen_pages.add(target)
        source_pages.append(target)

      pair_count = min(len(thumbnails), len(source_pages), max_num - len(candidates))
      for idx in range(pair_count):
        page_url = source_pages[idx]
        thumb_url = thumbnails[idx]
        parsed = urlsplit(page_url)
        title = parsed.path.split("/")[-1] or parsed.netloc or "Google image"
        candidates.append({
          "imageUrl": None,
          "thumbnailUrl": thumb_url,
          "sourcePageUrl": page_url,
          "title": title,
          "attribution": parsed.netloc or None,
        })

      if len(candidates) >= max_num:
        break

      tasks = parser.parse(response) or []
      for task in tasks:
        image_url = task.get("file_url")
        if not image_url or image_url in seen_images:
          continue
        seen_images.add(image_url)
        parsed = urlsplit(image_url)
        host = parsed.netloc or None
        title = parsed.path.split("/")[-1] or host or "Google image"
        candidates.append({
          "imageUrl": image_url,
          "thumbnailUrl": image_url,
          "sourcePageUrl": None,
          "title": title,
          "attribution": host,
        })
        if len(candidates) >= max_num:
          break

    return candidates


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", action="append", required=True)
    parser.add_argument("--max-num", type=int, default=12)
    args = parser.parse_args()

    queries = [query.strip() for query in args.query if query.strip()]
    payload_candidates = []
    for query in queries:
        for candidate in build_candidates(query, max(1, min(args.max_num, 20))):
            payload_candidates.append({
                **candidate,
                "searchQuery": query,
            })

    payload = {
        "query": "\n".join(queries),
        "candidates": payload_candidates,
    }
    print(json.dumps(payload, ensure_ascii=False))


if __name__ == "__main__":
    main()