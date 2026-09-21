import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const DEMO_EXPERIMENT_TEXT = `
Study of Half-Wave Rectifier

Objective:
To study the operation of a half-wave rectifier and to observe the output waveform.

Theory:
A half-wave rectifier is a circuit that converts alternating current (AC) to direct current (DC). It allows only one half-cycle of the AC input to pass through while blocking the other half-cycle.

The basic component of a half-wave rectifier is a p-n junction diode. When the anode of the diode is positive with respect to the cathode (forward bias), the diode conducts and current flows through the load resistor. When the anode is negative with respect to the cathode (reverse bias), the diode does not conduct and no current flows through the load.

The input AC voltage is given by:
Vin = Vm sin(ωt)

where Vm is the peak voltage and ω is the angular frequency.

During the positive half cycle (0 to π), the diode is forward biased and conducts. The output voltage across the load resistor is approximately equal to the input voltage (minus the diode forward voltage drop of approximately 0.7V for silicon diodes).

During the negative half cycle (π to 2π), the diode is reverse biased and does not conduct. The output voltage across the load is zero.

The output DC voltage (average value) is given by:
Vdc = Vm/π = 0.318 × Vm

The RMS value of the output voltage is:
Vrms = Vm/2 = 0.5 × Vm

The ripple factor is a measure of the effectiveness of the rectifier:
Ripple Factor = √((Vrms/Vdc)² - 1) = 1.21

This means the AC component in the output is 121% of the DC component, indicating poor filtering.

The efficiency of the half-wave rectifier is:
η = DC output power / AC input power = 40.6%

The peak inverse voltage (PIV) across the diode when it is reverse biased is:
PIV = Vm

Apparatus:
- Function generator (AC source)
- Silicon diode (1N4007)
- Load resistor (1kΩ)
- CRO (Cathode Ray Oscilloscope)
- Connecting wires
- Breadboard

Procedure:
1. Connect the circuit as per the circuit diagram.
2. Set the function generator to output a sine wave of 10V peak-to-peak at 50 Hz.
3. Connect the CRO to the input (across the function generator output).
4. Observe and note the input waveform on the CRO.
5. Connect the CRO across the load resistor.
6. Observe and note the output waveform.
7. Measure the peak output voltage (Vm) from the CRO.
8. Calculate the DC output voltage using Vdc = Vm/π.
9. Calculate the ripple factor.
10. Repeat for different input voltages.

Observations:
Input: Sine wave, 10V peak-to-peak, 50 Hz
Output: Half-wave rectified signal
Peak output voltage Vm = 4.3V (approximately)
DC output voltage Vdc = 4.3/π = 1.37V
Ripple factor = 1.21

Calculations:
Vm = 4.3V
Vdc = Vm/π = 4.3/3.14159 = 1.37V
Vrms = Vm/2 = 4.3/2 = 2.15V
Ripple Factor = √((Vrms/Vdc)² - 1) = √((2.15/1.37)² - 1) = √(2.46 - 1) = √1.46 = 1.21
Efficiency η = 40.6%

Result:
The half-wave rectifier was studied and the output waveform was observed. The DC output voltage was found to be 1.37V for an input peak voltage of 4.3V. The theoretical ripple factor of 1.21 was confirmed.

Precautions:
1. Check the polarity of the diode before connecting.
2. Do not exceed the PIV rating of the diode.
3. Ensure proper grounding of the CRO.
4. Keep hands away from the circuit when powered on.
5. Use appropriate current-limiting resistor to protect the diode.
`;

export async function POST() {
  try {
    const experiment = await prisma.experiment.upsert({
      where: { id: "demo-experiment" },
      update: {},
      create: {
        id: "demo-experiment",
        title: "Study of Half-Wave Rectifier",
        originalFileName: "half-wave-rectifier-demo.pdf",
        extractedText: DEMO_EXPERIMENT_TEXT,
      },
    });

    return NextResponse.json({
      success: true,
      experiment: {
        id: experiment.id,
        title: experiment.title,
      },
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { error: "Failed to seed demo experiment" },
      { status: 500 }
    );
  }
}
