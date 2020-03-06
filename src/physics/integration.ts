import { IEntity, IImpulse, IImpulseMap } from "../redux/state";
import { IVector, add, scale, zeroVector } from "../utils/geometry";
import { ImpulseTarget } from "../behaviors/utils";

export function integrateEntity(deltaT: number, entity: IEntity, externalForces: IVector) {
    entity.prevPosition = entity.position;

    let remainingT = deltaT;
    let impulseEntries = Object.entries(entity.impulses);
    while (remainingT > 0) {
        // figure out if there is an impulse with a smaller time remaining and accumulate velocity
        let accumVelocityImpulses = zeroVector();
        let accumAccelerationImpulses = zeroVector();
        let tPos = remainingT;
        impulseEntries.forEach((entry: [string, IImpulse]) => {
            const impulseData = entry[1];
            tPos = Math.min(tPos, impulseData.instant ? remainingT : impulseData.timeRemaining);
            if (impulseData.target == ImpulseTarget.Velocity) {
                accumVelocityImpulses = add(accumVelocityImpulses, impulseData.impulse);
            }
            else {
                accumAccelerationImpulses = add(accumAccelerationImpulses, impulseData.impulse);
            }
        });

        // integrate
        const t = tPos / 1000;
        entity.velocity = add(entity.velocity, scale(t, add(externalForces, accumAccelerationImpulses)));
        entity.position = add(entity.position, scale(t, add(entity.velocity, accumVelocityImpulses)));

        // decrement time
        remainingT -= tPos;
        impulseEntries.forEach((entry) => {
            let impulseData = entry[1];
            if (!impulseData.instant) {
                impulseData.timeRemaining -= tPos;
            }
        })

        // remove impulses with no time remaining
        impulseEntries = impulseEntries.filter((entry) => entry[1].timeRemaining > 0 || entry[1].instant);
    }

    // apply remaining impulses back to entity
    entity.impulses = {};
    impulseEntries.forEach((entry) => {
        if (!entry[1].instant) {
            entity.impulses[entry[0]] = entry[1];
        }
    });
}
