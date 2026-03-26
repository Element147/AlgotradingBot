package com.algotrader.bot.repository;

import com.algotrader.bot.entity.MarketDataCandle;
import com.algotrader.bot.entity.MarketDataCandleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MarketDataCandleRepository extends JpaRepository<MarketDataCandle, MarketDataCandleId> {

    @Query("""
        select candle
        from MarketDataCandle candle
        where candle.id.seriesId = :seriesId
          and candle.id.timeframe = :timeframe
          and candle.id.bucketStart between :windowStart and :windowEnd
        order by candle.id.bucketStart asc
        """)
    List<MarketDataCandle> findCandlesInRange(
        @Param("seriesId") Long seriesId,
        @Param("timeframe") String timeframe,
        @Param("windowStart") LocalDateTime windowStart,
        @Param("windowEnd") LocalDateTime windowEnd
    );
}
