# Google DocumentAI Expense processor 

## Summary 
This project offers an efficient solution for processing receipts using DocumentAI, optimized for handling large datasets through multi-file and batch processing techniques. By leveraging caching mechanisms, it ensures rapid access to previously scanned data, eliminating redundant operations and enhancing performance. Designed with simplicity in mind, the intuitive architecture seamlessly integrates with SQLite, providing a lightweight and portable database solution. Whether you're processing a single receipt or thousands, this tool ensures speed, accuracy, and ease of use.

- <a href="https://cloud.google.com/document-ai/docs/drag-and-drop"> Try Google Document AI online </a>


### Preview

[gexpense.webm](https://github.com/shellcatt/gexpense/assets/1937010/24d2a776-60e6-43d8-83d6-0b5ef831493c)

<small>(<a href="https://youtu.be/iMyxBJkGrq0" target="_blank">or YouTube</a>)</small>

---
## Tech stack
- NodeJS
- SQLite3

## Pre-requisits
- GNU Make (`make`)
- Docker CE (`docker compose`)
- Google Gloud Platform (`gcloud`)
- Google <a href="#">Document AI API</a> enabled 
- 
<!-- TODO: Explain processor & service account setup -->


## Install

- `mv .env.example .env`
- edit `MY-*` values


### Run 
- `make`

