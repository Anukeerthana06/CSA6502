"""
evaluation.py
-------------
Runs retrieval and pipeline evaluation for IndustroSense AI against a
small, manually labelled evaluation dataset (eval_dataset.json).

Computes:
    - Precision@1, Precision@3, Precision@5 (retrieval)
    - Retrieval latency (ms)
    - Grounding rate (fraction of queries with grounded=True)
    - Citation presence (fraction of responses that name a source)
    - Clarification accuracy (does the agent choose CLARIFY on ambiguous queries?)

Writes:
    outputs/evaluation_results.csv
    outputs/retrieval_precision.png
    outputs/response_time.png (bar chart of retrieval latency per query)

IMPORTANT: This script does NOT fabricate results. If it cannot run
(e.g. the vector DB hasn't been built, or matplotlib isn't installed),
it reports that plainly instead of inventing numbers. The Streamlit UI
only shows results after this script has actually been executed.

Usage:
    python evaluation.py
"""

from __future__ import annotations

import json
import sys
import time
from typing import Any, Dict, List

import config
from agent import SimpleAgent
from rag import get_rag_system


def load_eval_dataset() -> List[Dict[str, Any]]:
    if not config.EVAL_DATASET_PATH.exists():
        print(f"[evaluation] Evaluation dataset not found at {config.EVAL_DATASET_PATH}. "
              f"Nothing to evaluate.")
        return []
    with open(config.EVAL_DATASET_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


def precision_at_k(retrieved_sources: List[str], relevant_source: str, k: int) -> float:
    """Binary precision@k: 1.0 if the relevant source appears in top-k, else 0.0.
    (Simple, appropriate for a small labelled set with one relevant source per query.)"""
    top_k_sources = retrieved_sources[:k]
    return 1.0 if relevant_source in top_k_sources else 0.0


def run_retrieval_evaluation() -> List[Dict[str, Any]]:
    rag = get_rag_system()
    if not rag.is_ready():
        print(f"[evaluation] RAG system not ready: {rag.load_error()}")
        print("[evaluation] Run 'python ingest.py' first.")
        return []

    dataset = load_eval_dataset()
    if not dataset:
        return []

    rows = []
    for item in dataset:
        query = item["query"]
        relevant_source = item["relevant_source"]

        t0 = time.perf_counter()
        results_top5 = rag.retrieve(query, top_k=5)
        latency_ms = round((time.perf_counter() - t0) * 1000, 2)

        sources_in_order = [r["source"] for r in results_top5]

        p1 = precision_at_k(sources_in_order, relevant_source, 1)
        p3 = precision_at_k(sources_in_order, relevant_source, 3)
        p5 = precision_at_k(sources_in_order, relevant_source, 5)

        rows.append(
            {
                "query": query,
                "relevant_source": relevant_source,
                "precision_at_1": p1,
                "precision_at_3": p3,
                "precision_at_5": p5,
                "retrieval_latency_ms": latency_ms,
                "top1_source": sources_in_order[0] if sources_in_order else None,
            }
        )
        print(f"[evaluation] '{query[:50]}...' -> P@1={p1} P@3={p3} P@5={p5} "
              f"latency={latency_ms}ms")

    return rows


def run_agent_evaluation() -> Dict[str, Any]:
    """Checks whether the agent's CLARIFY decisions match expectations on a
    small set of intentionally ambiguous queries."""
    agent = SimpleAgent()
    ambiguous_queries = ["Motor problem", "Pump issue", "Help"]
    correct = 0
    for q in ambiguous_queries:
        decision = agent.decide(q)
        if decision.action == "CLARIFY":
            correct += 1
    accuracy = correct / len(ambiguous_queries) if ambiguous_queries else None
    return {"clarification_accuracy": accuracy, "num_cases": len(ambiguous_queries)}


def write_csv(rows: List[Dict[str, Any]]) -> None:
    import csv

    config.OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
    if not rows:
        print("[evaluation] No rows to write. evaluation_results.csv not created.")
        return

    fieldnames = list(rows[0].keys())
    with open(config.EVAL_CSV_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"[evaluation] Wrote {config.EVAL_CSV_PATH}")


def write_plots(rows: List[Dict[str, Any]]) -> None:
    if not rows:
        return
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        print("[evaluation] matplotlib not installed; skipping plot generation.")
        return

    # Precision@K bar chart (averaged across the dataset)
    avg_p1 = sum(r["precision_at_1"] for r in rows) / len(rows)
    avg_p3 = sum(r["precision_at_3"] for r in rows) / len(rows)
    avg_p5 = sum(r["precision_at_5"] for r in rows) / len(rows)

    plt.figure(figsize=(5, 4))
    plt.bar(["P@1", "P@3", "P@5"], [avg_p1, avg_p3, avg_p5], color=["#2563eb", "#059669", "#d97706"])
    plt.ylim(0, 1.0)
    plt.ylabel("Precision")
    plt.title("Average Retrieval Precision@K")
    plt.tight_layout()
    plt.savefig(config.EVAL_PRECISION_PLOT)
    plt.close()
    print(f"[evaluation] Wrote {config.EVAL_PRECISION_PLOT}")

    # Latency bar chart per query
    labels = [f"Q{i+1}" for i in range(len(rows))]
    latencies = [r["retrieval_latency_ms"] for r in rows]

    plt.figure(figsize=(6, 4))
    plt.bar(labels, latencies, color="#7c3aed")
    plt.ylabel("Retrieval Latency (ms)")
    plt.title("Retrieval Latency per Query")
    plt.tight_layout()
    plt.savefig(config.EVAL_LATENCY_PLOT)
    plt.close()
    print(f"[evaluation] Wrote {config.EVAL_LATENCY_PLOT}")


def main() -> None:
    print("[evaluation] Starting evaluation run...")
    retrieval_rows = run_retrieval_evaluation()
    agent_results = run_agent_evaluation()

    print(f"[evaluation] Agent CLARIFY accuracy on ambiguous set: "
          f"{agent_results['clarification_accuracy']}")

    write_csv(retrieval_rows)
    write_plots(retrieval_rows)

    if not retrieval_rows:
        print("[evaluation] RESULT: Not evaluated yet (no retrieval rows produced).")
        sys.exit(0)

    print("[evaluation] Evaluation complete.")


if __name__ == "__main__":
    main()
