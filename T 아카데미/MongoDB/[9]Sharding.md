## 샤딩

1. 샤딩의 개념과 정의를 알고 등장 배경에 대해 이해할 수 있습니다.
2. 샤딩 시스템을 구성하는 방법을 배울 수 있습니다.
3. 샤딩의 한계
---

##### 샤딩의 목적
 - 데이터의 분산저장
  : 단 한 대의 서버에 빅데이터를 저장하는 것은 불가능하다.
  이렇게하면 서비스의 성능 저하를 유발하여 초당 발생하는 엄청난 양의 Insert동장식 Write scaling 문제가 발생한다. 또한 디스크를 사용하는 하드웨어 한계성

  => 데이터를 분산하여 순차적으로 저장한다면 한 대 이상에서 트래픽을 감당하기 때문에 부하를 분산하는 효과가 있다.

  - 백업과 복구 전략
  : 데이터 분산이라는 샤딩의 가장 대표적인 기능을 통해 얻는 효과
      - 시스템의 성능 향상
      - 데이터 유실 가능성으로부터 보토
      : 서버의 데이터가 유실된다면 그 데이터 양은 상상을 초월할 것이고 시스템 복구에 엄청난 시간과 비용이 소요된다.

  => 미리 데이터를 분산하여 저장해둔다면 리스크로부터 보호 받고 효과적인 시스템 운영이 가능해진다.

  - 빠른 성능
  : 여러 대의 독립된 프로세스가 병렬로 작업을 동시에 수행하기 때문에 이상적으로는 빠른 처리 성능을 보장받는다.

  ![스크린샷 2017-04-06 오전 11.37.04](http://i.imgur.com/TNE2MS9.png)


###### 샤딩의 개념과 정의
- 샤딩 시스템의 특징
  1. 샤딩 시스템은 분산 처리를 통한 효율성 향상을 가장 큰 목적으로한다.
      - 가능한 성능 보장을 위해 3대 이상의 서버를 샤드로 활용하는 것을 추천
      - 최소 2대만 있으면 샤드서버 구축이 가능
  2. 샤드 서버로 운영하게 되면 기존에 한 대의 서버로 운영할 때보다 메모리를 20~30% 정도 추가로 사용하게 된다.
      - 샤드 시스템 구축시 사용하는 라우팅서버인 mongos와 Oplog, Balancer프로세스가 추가로 메모리를 사용하기 때문
      - 기존에 싱글 서버보다 20~30% 정도 추가 메모리를 준비 필요

- Config 서버 개요
  1. 샤드 시스템 구축 시 필요한 Config서버의 특징
      - Config 서버는 샤드 시스템에 대한 메타 데이터 저장/관리 역할
      - 샤드 서버의 인덱스 정보를 빠르게 검색 가능하게 함
      - 샤드 서버와 별도의 서버에 구축이 기본
      - 장애 발생에 대비하여 최소 3대 이상 사용(최소1대만으로도 운영가능)
      - 샤드 서버에 비해 저사양 서버 사용 가능


- mongos 서버 특징
    - 하나 이상의 프로세스를 사용
    - Config서버의 Meta-data를 캐시한다.
    - 빅데이터를 샤드 서버로 분산해주는 프로세스이다.
```
- Config 서버는 각 샤드 서버에 어떤 데이터들이 어떤 식으로 분산 저장되어 있는지ㄷ에 대한 Meta데이터가 저장되어 있는데, Mongos서버를 통해 데이터를 쓰고 읽는 작업이 가능하다.
- 또한 Mongos는 각 서버에서 어떤 일을 하는지 개발자가 모르게 해주는 역할을 한다. Mongos를 통해 지금 샤딩 상태인지 리플리케이션 상태인지 개발자는 알 필요가 없다.
```
    - 중계자 계층으로 샤딩 시스템의 가장 핵심적인 부분으로, 샤드 메타 정보를 저장하여 응용 계층으로부터 전달된 질의를 분석하여 적절한 샤드에 명령을 수행 시킨 다음 그 결과를 응용 계층으로 다시 전달해준다.

    ![스크린샷 2017-04-06 오전 11.51.44](http://i.imgur.com/x7gyeJn.png)


- Shard key 구성
Shard key 구성 방법이 Mongodb 샤딩 시스템을 구축할 때 가장 중요하다.
Shard key는 여러개의 shard서버로 분할 될 기준 필드를 가리키며, 앞으로 partition과 load balancing에 기준이 된다. 때문에 mongodb데이터 저장과 성능에 절대적 여향을 미친다.

샤드키는 카디널리티(cardinality)를 보고 적절한 선택이 필요하다. 데이터 분포가 넓으면 Low카디널리티라고 표한하고, 분표가 높으면 High카디널리티라고 부른다.

Shard key는 Chunk migration의 횟수와 빈도를 결정한다.

하나의 서버에 저장되는 데이터들을 여러 개의 논리적 구조로 분할 저장하다가 일정한 데이터 양에 도달했을 때 두 번째, 세 번쨰 서버로 데이터를 분할하여 저장하여, 이 분할 단위를 Chunk라 부른다. Chunk크기는 기본적으로 64MB(100,000행)단위로 분할되며, 필요시 64MB이상의 Chunk 크기를 갖는 것도 가능하다.

기본 설정 단위보다 빈번하게 Chunk migration이 발생한다면 Chunk크기를 더욱 크게 설정해야 한다.
2. 샤딩 구성방식

![스크린샷 2017-04-06 오후 12.19.44](http://i.imgur.com/cm7s7Ql.png)

![스크린샷 2017-04-06 오후 12.20.27](http://i.imgur.com/O0N7sIO.png)

![스크린샷 2017-04-06 오후 12.20.52](http://i.imgur.com/nQd0kMn.png)

![스크린샷 2017-04-06 오후 12.21.33](http://i.imgur.com/wJx92C2.png)

![스크린샷 2017-04-06 오후 12.22.07](http://i.imgur.com/MjxEowX.png)

![스크린샷 2017-04-06 오후 12.22.29](http://i.imgur.com/Z0vgpdq.png)
3. MongoDB 샤딩 한계
  - 한 청크에 저장될 수 있는 BSON객체의 개수는 250,000개이다.
  - 한 청크에 설정할 수 있는 분할 지점의 최대 개수는 8,192개이다.
  - 몽고디비로 설정할 수 있는 샤드 노드의 개수는 1,000개가 목표이다.
  (현 시점에서는 100개 정도로 한정하고 있다)
  - 원인을 알 수 없는 문제로 인해 마스터 서버가 fail되어도 mongos는 쓰레드 ReplicaSetMonitorWatcher가 수행되기 전까지 여전히 fail된 mongod를 마스터로 간주할 수 있다.
  이 시점에 응용계층에서 전달된 질의를 수행하면 에러가 발생된다.  
  또한, 새로운 마수터가 선출되기 전에 삽입하고자 했던 데이터가 사라졌다는 것을 인식할 수 없어서 데이터 유실의 가능성이 발생한다.

  - 몽고디비의 mongos는 마스터 선출에 관여할 수 없기 떄문에, 마스터가 없을 때 슬레이브가 읽기 연산 모드를 지원해주지 않는다면 전체 시스템이 다운될 수 있다.
