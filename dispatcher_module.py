"""
dispatcher_module.py — Team 4 Dispatcher Component
---------------------------------------------------
Simulates context switch overhead for any scheduling algorithm.
Used by runtime to overlay realistic CPU switching behavior
without modifying scheduler_core internals.
"""

class Dispatcher:
    def __init__(self, context_switch_time=0):
        self.context_switch_time = int(context_switch_time)
        self.total_context_switches = 0
        self.total_context_switch_time = 0

    def do_switch(self, prev_pid, next_pid, current_time):
        """
        Perform a context switch if switching to a different process.
        Returns (updated_time, context_switch_segment)
        """
        if (
            prev_pid is None
            or prev_pid == next_pid
            or self.context_switch_time <= 0
        ):
            return current_time, None

        self.total_context_switches += 1
        self.total_context_switch_time += self.context_switch_time

        cs_start = current_time
        cs_end = cs_start + self.context_switch_time

        cs_segment = {
            "pid": "CS",
            "start": cs_start,
            "end": cs_end
        }

        return cs_end, cs_segment

    def summary(self):
        return {
            "context_switches": self.total_context_switches,
            "context_switch_time_total": self.total_context_switch_time,
            "context_switch_time_unit": self.context_switch_time
        }
