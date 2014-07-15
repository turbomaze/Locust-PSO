/******************\
|  Faucet: Random  |
|   n-Dim. Fields  |
| @author Anthony  |
| @version 1.0     |
| @date 2014/07/14 |
| @edit 2014/07/14 |
\******************/

var Faucet = (function() {
    /**********
     * config */
    var basisFunction = function(ps, x) {
        if (ps.length !== 3) return 0;
        return ps[0]*Math.sin(ps[1]*x + ps[2]);
    };

    /***********
     * objects */
    function Field(params) { 
        this.func = function(xs) {
            var sum = 0;
            for (var ai = 0; ai < params.length; ai++) {
                sum += basisFunction(params[ai], xs[ai]);
            }
            return sum;
        };
    }
    Field.prototype.eval = function(xs) {
        return this.func(xs);
    };

    return { //return public functions
        /** @params
          * ranges  --- range of values each dimension is defined over
          * max     --- the maximum value achievable by any input vector
          *
          * @return
          * a Field that accepts n-Dimensional input
        **/
        drip: function(ranges, max) {
            //get n random amplitudes
            var n = ranges.length;
            var amplitudes = [];
            var ampSum = 0;
            for (var ai = 0; ai < n; ai++) {
                var amp = Math.random();
                amplitudes.push(amp);
                ampSum += amp;
            }

            //normalize them so they sum to max
            for (var ai = 0; ai < n; ai++) amplitudes[ai] *= max/ampSum;

            //get n periods
            var periods = [];
            for (var ai = 0; ai < n; ai++) {
                var w = 2*Math.PI/(ranges[ai][1]-ranges[ai][0]);
                periods.push(w); //entire range evolves one period
            }

            //get n shifts
            var shifts = [];
            for (var ai = 0; ai < n; ai++) {
                var shift = Math.random()*(ranges[ai][1]-ranges[ai][0]);
                shifts.push(shift);
            }

            //zip up the amps, periods, and shifts
            var params = [];
            for (var ai = 0; ai < n; ai++) {
                params.push([amplitudes[ai], periods[ai], shifts[ai]]);
            }

            return new Field(params);
        }
    };
})();
