import { SIZE } from '../constants';
import { correctUnitsShift, getUnitX, nodeCount, sameAs } from '../utils/units';
import { rightOf, unitNodesCount, widthOf } from '../utils/family';
import { nextIndex } from '../utils';
const arrangeNextFamily = (family, nextFamily, right) => {
    const unit = family.children[0];
    const index = nextFamily.parents.findIndex(sameAs(unit));
    index === 0 && nextFamily.parents[index].pos === 0
        ? (nextFamily.X = getUnitX(family, unit))
        : (nextFamily.parents[index].pos = getUnitX(family, unit) - nextFamily.X);
    const nextIdx = nextIndex(index);
    if (nextFamily.parents[nextIdx]) {
        correctUnitsShift(nextFamily.parents.slice(nextIdx), right - getUnitX(nextFamily, nextFamily.parents[nextIdx]));
    }
};
export const arrangeFamiliesFunc = (store) => (family) => {
    let right = 0;
    while (family.cid) {
        right = Math.max(right, rightOf(family));
        const nextFamily = store.getFamily(family.cid);
        const unit = family.children[0];
        if (!nextFamily.cid) {
            unit.pos = (widthOf(family) - nodeCount(unit) * SIZE) / 2;
        }
        else {
            if (family.parents.length === 2 && unitNodesCount(family.parents) > 2)
                unit.pos = Math.floor(family.parents[1].pos / 2);
            arrangeNextFamily(family, nextFamily, right);
        }
        family = nextFamily;
    }
};
