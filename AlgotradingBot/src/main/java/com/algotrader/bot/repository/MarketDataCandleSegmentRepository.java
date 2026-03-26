package com.algotrader.bot.repository;

import com.algotrader.bot.entity.MarketDataCandleSegment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface MarketDataCandleSegmentRepository extends JpaRepository<MarketDataCandleSegment, Long> {

    @Query("""
        select segment
        from MarketDataCandleSegment segment
        where segment.series.id = :seriesId
          and segment.timeframe = :timeframe
          and segment.coverageStart <= :requestedEnd
          and segment.coverageEnd >= :requestedStart
        order by segment.coverageStart asc, segment.createdAt asc
        """)
    List<MarketDataCandleSegment> findOverlappingSegments(
        @Param("seriesId") Long seriesId,
        @Param("timeframe") String timeframe,
        @Param("requestedStart") LocalDateTime requestedStart,
        @Param("requestedEnd") LocalDateTime requestedEnd
    );
}
