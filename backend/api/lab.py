from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import LabExperiment
from schemas import (
    CPUSchedulingRequest, CPUSchedulingResponse,
    BankersRequest, BankersResponse,
    PageReplacementRequest, PageReplacementResponse
)
from services.os_algorithms import (
    CPUScheduler, BankersAlgorithm, PageReplacementSimulator
)

router = APIRouter()

@router.post("/lab/cpu-scheduling", response_model=CPUSchedulingResponse)
def simulate_cpu_scheduling(req: CPUSchedulingRequest, db: Session = Depends(get_db)):
    procs_data = [p.dict() for p in req.processes]
    alg = req.algorithm.lower()

    if "fcfs" in alg:
        res = CPUScheduler.run_fcfs(procs_data)
    elif "srtf" in alg:
        res = CPUScheduler.run_srtf(procs_data)
    elif "sjf" in alg:
        res = CPUScheduler.run_sjf(procs_data)
    elif "priority" in alg:
        res = CPUScheduler.run_priority(procs_data)
    elif "round" in alg or "robin" in alg:
        res = CPUScheduler.run_round_robin(procs_data, quantum=req.time_quantum or 2)
    else:
        res = CPUScheduler.run_fcfs(procs_data)

    try:
        exp = LabExperiment(
            user_id=1,
            algorithm_type=f"cpu_scheduling_{req.algorithm}",
            input_data=req.dict(),
            result_data=res
        )
        db.add(exp)
        db.commit()
    except Exception as e:
        print(f"Error logging lab experiment: {e}")

    return CPUSchedulingResponse(**res)

@router.post("/lab/bankers", response_model=BankersResponse)
def simulate_bankers_algorithm(req: BankersRequest, db: Session = Depends(get_db)):
    res = BankersAlgorithm.evaluate(
        processes=req.processes,
        resources=req.resources,
        allocation=req.allocation,
        max_matrix=req.max_matrix,
        available=req.available,
        request_process=req.request_process,
        request_vector=req.request_vector
    )

    try:
        exp = LabExperiment(
            user_id=1,
            algorithm_type="bankers_deadlock_avoidance",
            input_data=req.dict(),
            result_data=res
        )
        db.add(exp)
        db.commit()
    except Exception as e:
        print(f"Error logging lab experiment: {e}")

    return BankersResponse(**res)

@router.post("/lab/page-replacement", response_model=PageReplacementResponse)
def simulate_page_replacement(req: PageReplacementRequest, db: Session = Depends(get_db)):
    alg = req.algorithm.upper()
    if "LRU" in alg:
        res = PageReplacementSimulator.run_lru(req.reference_string, req.frames_count)
    elif "OPT" in alg:
        res = PageReplacementSimulator.run_optimal(req.reference_string, req.frames_count)
    else:
        res = PageReplacementSimulator.run_fifo(req.reference_string, req.frames_count)

    try:
        exp = LabExperiment(
            user_id=1,
            algorithm_type=f"page_replacement_{alg}",
            input_data=req.dict(),
            result_data=res
        )
        db.add(exp)
        db.commit()
    except Exception as e:
        print(f"Error logging lab experiment: {e}")

    return PageReplacementResponse(**res)
