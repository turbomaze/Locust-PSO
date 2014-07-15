/*******************\
| Locust - Particle |
|  Swarm Optimizer  |
| @author Anthony   |
| @version 0.1      |
| @date 2014/07/14  |
| @edit 2014/07/14  |
\*******************/

var Locust = (function() {
    /**********
     * config */

    /*************
     * constants */

    /*********************
     * working variables */

    /***********
     * objects */

    /********************
     * helper functions */
    function getRandInt(low, high) { //output is in [low, high)
        return Math.floor(this.getRandFloat(low, high));
    }
    function getRandFloat(low, high) { //output is in [low, high)
        return low + Math.random()*(high-low);
    }

    return { //return public functions
        /** @params
          * config   --- JSON that changes the behavior of Locust
          * wrapper  --- object that outputs a score for a given combination
          *              of parameters; the field over which to optimize
          *
          * @return
          * the best set of parameters discovered using the conditions
          * outlined in config
        **/
        optimize: function(config, wrapper) {
            
        }
    };
})();
