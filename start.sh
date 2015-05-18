#!/bin/bash
BASE_DIR=$(cd $(dirname $BASH_SOURCE)/../; pwd)

usage(){
    /usr/bin/clear
    echo -ne "\tstart.sh start|stop|restart\n"
    echo -ne "\tstart h|-h|--help \n"
    echo -en "\t\t- show usage\n\n"
    exit 1
}

running_count() {
    number=$(ps ax | grep -v "grep" | grep "python" | grep "500" | wc -l)
    echo $number
}

start_instance() {
    python run.py 5001 >/dev/null 2>&1 &
    python run.py 5002 >/dev/null 2>&1 &
    python run.py 5003 >/dev/null 2>&1 &
    python run.py 5004 >/dev/null 2>&1 &
    python run.py 5005 >/dev/null 2>&1 &
}

start() {
    number=$(running_count)
    if [ $number -gt 0 ];
    then
        echo "running, start failed"
    else
        start_instance
        echo "started"
    fi
}
 
stop() {
    number=$(running_count)
    if [ $number -gt 0 ]
    then
        ps ax | grep "python" | grep -v grep | grep "500" | awk '{print $1}' | xargs kill
        sleep 1
    fi
    echo "stoped"
}

restart() {
    number=$(running_count)
    if [ $number -gt 0 ]
    then
        stop
        start
    fi
    echo "restart done"
}

case "$1" in
    start)
        if [ $# -ne 1 ]
        then
            usage
        fi
        start
        ;;
     
    stop)
        if [ $# -ne 1 ]
        then
            usage
        fi
        stop
        ;;
    restart)
        restart
        ;;
     
    status)
        number=$(running_count)
        if [ $number -gt 0 ]
        then
            echo "$number instance is running"
        else
            echo " not running"
        fi
        ;;

    h|-h|--help)
        usage
        ;;
    *)
        usage
        ;;
esac
